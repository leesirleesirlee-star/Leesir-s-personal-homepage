# V4 设计文档 — R3 互动数据 + 反馈驱动修复 + 液态玻璃增强（含 V4.1 时间线）

> 状态：**实施完成，待用户真机验收**（2026-09-25）；验收期间用户新增需求「项目进程 Timeline」记为 **V4.1**，见 §7
> 轮次口径：用户称本轮为 "V4"（= PRD V3 流程中的 R3 互动数据 + 一轮反馈驱动修复）
> 上游输入：`个人主页网站反馈.rtf`（13 项 UI 审计 + P0/P1/P2 建议 + 「只做三件事」清单）+ 验收期追加「时间线」需求
> 关联文档：`docs/v3-design.md`（§6 R3 规格）、`docs/v3-supabase-setup.sql`（表/RPC 权威定义）、`docs/digital-resin.md`（V4.1 时间线内容来源）

---

## 1. 本轮范围（用户已确认）

| 项 | 内容 |
|---|---|
| R3 互动数据 | 项目浏览量（打开详情计数）· 喜爱（单向点赞）· 留言（昵称+内容，50 条倒序） |
| 只做三件事 ① | 触控热区 ≥44px + `:active`/`:focus-visible` 反馈 |
| 只做三件事 ② | 表单控件对比度 ≥3:1（WCAG） |
| 只做三件事 ③ | PWA 图标/manifest/theme-color/OG + Supabase 按需加载 |
| 附带项 | 深色头像不反相 · 中文「聊天」 · 版本提示统一 V4 · 防深色闪白 · 安全区 |
| 追加要求 | **液态玻璃增强（贴近 iOS 液态玻璃；不削弱现有玻璃；尽量少用实时计算）** |
| 不做（范围 B/C） | 内容结构改造（求职信号、技能矩阵、时间线等）——需用户素材，另行安排 |

---

## 2. 反馈分类与决策表（PRD V4 流程要求）

分类：A=事实 / B=可用性 / C=偏好 / D=新需求；决策：Adopt / Partially Adopt / Defer / Do Not Adopt

| # | 反馈项 | 分类 | 决策 | 实现与理由 |
|---|---|---|---|---|
| 1 | 触控目标 <44px | B | Adopt | 伪元素 `::after` 扩展命中区至 44×44（视觉尺寸不变）；触摸设备导航链接加高 |
| 2 | 缺 `:active`/`:focus-visible` | B | Adopt | 全局键盘焦点描边（仅键盘触发）；9 类控件 60ms 按压缩放 |
| 3 | 表单控件对比度 <3:1 | B | Adopt | 新增 `--input-border/--input-bg`：浅色 0.52 黑描边 / 深色 0.36 浅描边，达 3:1 |
| 4 | 0 个 rem 单位 | C | Defer | 全量换算回归风险高、视觉收益低；本轮聚焦互动数据与三件事 |
| 5 | 深色首屏闪白（FOUC） | B | Adopt | `<head>` 内联脚本在渲染前设定 `data-theme`（样式表之前执行） |
| 6 | 首屏加载 supabase-js 218KB | A | Adopt | 移除静态 `<script>`；`loadSupabase()` 按需注入（打开详情/提交反馈时），加载一次复用 |
| 7 | 图片资源未优化 | A | Partially Adopt | 聊天头像改用 112px 切片（5KB，替代 3×135KB 大图）；WebP/AVIF 因本机无编码器（sips 不支持写 WebP）Defer；portrait srcset Defer |
| 8 | 缺 favicon/manifest/theme-color/OG | A | Adopt | favicon.svg + icon-192/512 + apple-touch-icon(180) + manifest + 双色 theme-color + OG/Twitter + sitemap.xml + robots.txt；OG 卡 1200×630 |
| 9 | 无 safe-area 适配 | B | Adopt | `viewport-fit=cover` + `env(safe-area-inset-*)`（导航/聊天输入/菜单/回顶按钮） |
| 10 | 设计 token 未体系化 | C | Partially Adopt | 新增输入控件 token（`--input-*`）；全局 token 重构 Defer（与卡片语义重构同批） |
| 11 | 断点仅 max-width | C | Defer | 全站断点重构风险大；已补 `pointer: coarse` 与 `prefers-reduced-*` 查询 |
| 12 | `lang` 属性与内容不同步 | A | 已满足 | 复核 `applyLang()` 已同步 `<html lang>`（zh-CN/en），无需改动 |
| 13 | 导航项 6 个偏多 | C | Do Not Adopt | 用户此前明确决策保留「信息/聊天 + 5 锚点」结构；理由：反馈/联系是核心转化路径 |
| 14 | P0 求职信号 / P1 技能矩阵·时间线 / P2 画廊 | C/D | Partially Adopt（V4.1） | **时间线部分已实施**（V4.1，§7：Projects 板块「项目进程」总览，内容取自 `docs/digital-resin.md`）；求职信号 / 技能矩阵 / 画廊仍 Defer，待用户素材与职业定位 |
| 15 | 项目卡内嵌链接（语义） | C | Defer | 需卡片整体语义重构，与 #11 同批；本轮保持现状（键盘可达性已达标） |

---

## 3. R3 互动数据实现（Supabase 直连）

### 3.1 数据流

| 动作 | 触发 | 机制 | 防刷 |
|---|---|---|---|
| 浏览量 +1 | 打开项目详情模态 | RPC `increment_views(p_project_id)` → 返回最新值 | `sessionStorage[viewed:<id>]`（每会话每项目一次；先标记后请求，失败不重试） |
| 喜爱 +1 | 点击「喜爱」按钮 | RPC `increment_likes(p_project_id)` → 返回最新值 | `localStorage[liked:<id>]`（单向，已赞不可撤销） |
| 留言 | 提交表单 | `comments.insert({project_id, content, nickname?})` | honeypot 字段 + 30s 本地限频 + 昵称/内容长度前端截断（30/500） |
| 读取 | 打开模态 | `project_stats` 单行查询 + `comments` 倒序前 50 条 | RLS：anon 只读 stats/comments、只插 comments/feedback |

### 3.2 关键实现点

- **昵称可留空**：留空则不提交 `nickname` 字段，由数据库默认值「访客」兜底（避免显式 null 违反 NOT NULL）。
- **XSS 防护**：留言渲染统一走 `escapeHtml()`（昵称/内容/日期），不使用未转义的 innerHTML 拼接。
- **降级**：supabase-js 加载失败时留言区显示可见错误提示；统计数字保持 `—`；点赞按钮恢复可用态。
- **语言切换**：模态打开时切换语言会重渲染详情并重新加载互动数据（浏览计数因会话标记不会重复 +1）。

### 3.3 未做的取舍

- **不做实时订阅**（realtime）：静态站访客少，订阅成本高于收益；重开模态即最新。
- **不做点赞撤销**：单向更简单，也避免计数抖动（与「喜爱量」语义一致）。
- **留言上限 50 条**：前端 limit 50，暂不分页（留言量级预期低）。

---

## 4. 液态玻璃增强（用户追加要求）

**原则：不削弱现有玻璃观感；用「静态光学层 + 材质分层」实现 iOS 液态玻璃质感，避免实时滤镜开销。**

| 手段 | 实现 | 为什么省 |
|---|---|---|
| ① 光学层（折射渐变） | `--glass-bg` 升级为 `linear-gradient(155deg, 亮面→过渡→反光) + 基调色`（浅/深两套），所有玻璃控件自动继承 | 静态渐变由 GPU 合成，零逐帧计算 |
| ② 四边高光 | `--glass-highlight` 从 2 层 inset 升级为 4 层（顶亮/左右微光/底暗），模拟玻璃厚度边缘 | box-shadow 一次性绘制，transform 动画走合成层 |
| ③ 材质分层 | 背后是**纯色背景**的卡片/输入控件停止 `backdrop-filter` 实时采样（背后无内容穿过，模糊前后视觉等价）；实时模糊只保留给导航/模态/移动菜单/回顶等「内容会穿过」的浮层 | 省去滚动时大量逐帧采样（卡片数量多、面积大） |
| ④ 无障碍回退 | `@media (prefers-reduced-transparency: reduce)` 时浮层回退不透明材质（Apple 同款思路） | 无运行时成本 |
| ⑤ 导航遮罩回退 | 此前试探性的 `--nav-bg` 加深（0.62→0.72）**已回退**，保持原有通透度 | — |

**注意（防回归）**：`--glass-bg` 现在的值是「渐变 + 颜色」多背景；后续若对使用该变量的元素做 `background` 简写覆盖，会清空渐变（下拉框箭头曾因此差点被清空，已用 `background-color` 覆盖修复）。

---

## 5. 验证证据

| 项 | 结果 |
|---|---|
| JS 语法（jsc `new Function` 解析） | ✅ 通过 |
| i18n 键一致性（HTML 90 键 / zh 120 / en 120） | ✅ 无缺失、双语对称（新增 `feedback.contentHint` 修复） |
| DOM id / CSS 类引用一致性 | ✅ 静态引用无缺失；动态渲染 id/类均在 CSS 有定义 |
| 本地服务器资源 | ✅ index/css/js/og-cover 全部 200 |
| 覆盖顺序核查 | ✅ 深色头像 `filter: none` 位于原 `invert(1)` 之后生效 |
| Supabase 交互（RPC/插入/读取） | ⏳ 本机代理间歇阻断 curl（已知问题 #8），**由用户浏览器链路验收**：打开项目详情看浏览量 +1、点赞、发一条留言 |
| V4.1 Timeline（jsc 语法 / i18n 93↔127 对称 / 类名与 id 一致 / 资源 200） | ✅ 见 §7.3；真机视觉待用户验收 |

---

## 6. 遗留与下一轮候选

1. **WebP/srcset**：待具备编码器（或部署侧转换）后补；本轮仅头像切片。
2. **rem 换算 + 断点体系 + 卡片语义重构**：合并为一次「结构质量」轮次。
3. **内容结构（范围 B）**：求职信号、项目量化成果、技能矩阵、画廊 — 需用户素材。（时间线部分已由 V4.1 覆盖，见 §7）
4. **测试收尾（R5）**：≥3 人真实测试 + 反馈分类 + tag（建议本轮验收后打 `v3.0`）。

---

## 7. V4.1 追加：项目进程 Timeline（Projects 板块总览）

> 来源：用户真机验收期间新增需求——「在个人项目介绍中加入时间线 UI 展示项目进程，参考 namethatui.com/web/timeline，使界面更清晰整洁、更具设计感」。
> 澄清结论（question 工具确认）：① 位置 = **Projects 板块总览**（不进详情弹窗即可见）；② 时间信息 = **阶段编号 + 状态标签**（不虚构日期）。

### 7.1 设计规范对照（namethatui: Timeline = `<ol>` + dot + connector + opposite content）

| 规范（原文要点） | 落实 |
|---|---|
| 事件有真实顺序 → `<ol>` 语义列表 | `<ol class="timeline" aria-labelledby="timeline-title">` + `<li class="timeline-item">` |
| connector「one segment per event, from its dot to the next, ending at the last dot」；每项自拥圆点下方线段，禁止整列表一根大竖线（会越过最后圆点） | 每项 `::before` 只画「当前圆点 → 下一圆点」一段（`top: var(--tl-dot-y); height: 100%`，跨越项间距恰好抵达下一圆点中心）；**最后一项不画线**，止于最后圆点 |
| dot 与 connector 必须同一水平中心（防 border/width 造成的 1px 错位） | 轴心统一为 `calc(--tl-phase-w + --tl-axis-w/2)`；dot 用 `justify-self: center`（border 在 border-box 内，外径不变） |
| opposite content（对侧时间列）需固定宽度，避免长短不一顶歪轴线 | 阶段编号列固定宽（桌面 84px → 768px 58px → 560px 46px），右对齐 |
| Solid dot = 已发生；in-progress = hollow/loading 点 | 已完成 = 实心点 + 光晕；进行中 = 空心呼吸点（`tl-pulse`，与 hero live 点同构、换主题色）；规划中 = 描边空心点 |
| 时间戳用 `<time datetime>` | 本项**不使用**（用户选择阶段编号，无真实日期，避免虚构） |
| 视觉顺序 = 阅读顺序（禁用纯 CSS 翻转） | 阶段 01→05 自上而下，DOM 顺序一致 |
| 未提但纳入 | 进行中 → 规划中的连接段改**虚线**，表达「尚未发生」 |

### 7.2 实现要点

- **数据**：`main.js` 新增 `TIMELINE` 数组（双语）——阶段 01 分子建模与能量计算 / 02 孔隙结构与扩散映射 / 03 扩散-吸附数值模拟（已完成）→ 04 MVP 收尾（进行中）→ 05 后续扩展（规划中）。内容取自 `docs/digital-resin.md`，与详情模态 done(6)/next(3)/future(7) 三组清单**互补不重复**（timeline = 总览级 5 阶段）。
- **渲染**：`renderTimeline()` 由 `applyLang()` 调用（首屏初始化与语言切换共用）；i18n 新增 7 键（`timeline.*`，zh/en 对称）。
- **入场动画**：timeline 项为动态渲染——`initReveal` 重构为「模块级观察器 + `observeRevealNodes()` 登记函数」：初始化阶段留给 initReveal 统一观察，IO 不可用时直接显现；逐项 `transition-delay` 错峰（0.07s 步进）。
- **焦点设计**：当前阶段卡片 = 主题色描边 + 提升阴影 + 呼吸点（页面唯一「当前焦点」）；规划中卡片 = 虚线描边 + 透明底 + 无阴影。
- **样式**：`styles.css` 新增 V4-12 区块（浅/深两套 timeline 变量定义在 `.timeline-block`）；卡片沿用预合成材质（零实时模糊），不破坏 V4-11 材质分层。
- **响应式与动效降级**：768px / 560px 两级收紧；`prefers-reduced-motion` 下关闭呼吸动画与错峰延迟。
- **版本**：资源引用 `?v=4.0.0 → 4.1.0`（cache-busting 必需）；footer 版本提示保持 `V4`（按 V2 期惯例，footer 只在发布级更新）。

### 7.3 验证

| 项 | 结果 |
|---|---|
| JS 语法（jsc） | ✅ 通过（仅预期 `document` 运行时错误） |
| i18n 键一致性（HTML 93 键 / zh 127 / en 127） | ✅ 双语对称、无缺失 |
| Timeline 类名 / id | ✅ CSS 全部类均有定义；`#timeline`、`#timeline-title` 唯一；渲染所引 i18n 键均命中 |
| 本地服务器资源 | ✅ index.html / styles.css / main.js 均 200（`?v=4.1.0`） |
| 真机视觉 | ⏳ 用户浏览器验收（DeepWorks Browser 已打开 `index.html#projects`） |

### 7.4 交接注意（防回归）

1. **动态 `.reveal` 必须登记**：任何新增的 JS 动态渲染节点带 `.reveal` 类时，渲染后需调用 `observeRevealNodes()`，否则保持 `opacity: 0` 不可见。
2. **轴线几何耦合**：dot 中心 y 必须等于 `--tl-dot-y`；轴线 x 必须等于 `--tl-phase-w + --tl-axis-w/2`——改列宽/间距只动 `.timeline` 上的变量，线段与圆点自动对齐。
3. **最后一项不画连接线**：`::before` 用 `:not(:last-child)` 选择器；勿改成整列表大竖线（违反参考规范，会越过最后圆点）。
4. **改 CSS/JS 后 bump `?v=` 版本号**（当前 `4.1.0`）。
