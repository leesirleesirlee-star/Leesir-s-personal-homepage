# 项目推进记录 — Nick Lee Personal Homepage

> 本文档是项目的**总进度档案**，用于任务暂停/恢复时避免信息断层。
> 最后更新：2026-09-08（V2.1 完成：navbar 滚动分层 + 模态修复 + 摄影特长 + Info/Chat 切换）
>
> 重要：本人中文名为 **李泽毓**（Nick Lee / Li Zeyu），**不是**李泽民。此前所有文件中已统一更正。

---

## 1. 项目一句话

个人主页网站（学院风 · 苹果式简洁 · 浅色/深色双主题），按 PRD 迭代路线推进——**V1（MVP）已完成并验收，V2（视觉/交互升级）已完成，V2.1（修复 + 小特性）已完成，V3（社交互动 + 数据库）待启动。**

---

## 2. 技术栈与运行方式

- 纯静态前端：`index.html` + `assets/css/styles.css` + `assets/js/main.js`（无构建、无框架、无后端）。
- 运行：本地静态服务器（当前端口 **8000**，日志在 `.deepworks/tmp/`）。启动方式由主导者按需处理。
- 校验工具（本机 macOS，无 node/无浏览器脚本）：
  - JS 语法：`/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc assets/js/main.js`（只看是否 `SyntaxError`；出现 `ReferenceError: Can't find variable: document` 是预期，因是非浏览器环境）。
  - HTTP：`curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/{index.html,assets/css/styles.css,assets/js/main.js}`，应全 200。
  - i18n 配对：用 python3 正则对比 `index.html` 的 `data-i18n` key 与 `main.js` 词典 key。

---

## 3. git 状态（截至 2026-09-08）

- 分支：`main`。工作区**干净**（源码无未提交改动）。
- 未跟踪：`.opencode/skills/ppt-generator/`、`.opencode/skills/skill-8e15730e/`（DeepWorks 工具目录，**不属于本项目，不提交**）。
- Tag：`v1.0`（指向 `a99c6d7`）、`v2.0`（指向 `123c967`）。

### 提交链（新→旧）

| Commit | 内容 / 阶段 |
|---|---|
| `f5e64df` | V2.1: navbar 滚动分层 + 模态修复 + 摄影特长 + Info/Chat 视图切换 |
| `d799d62` | docs: 新增总进度档案（本文件） |
| `123c967` | docs: V2 实现证据记录（v2.0 指向此） |
| `1930eb3` | V2 R4: 移动菜单 + scroll spy + 响应式 + footer V2.0 |
| `8bccf4d` | V2 R3: About 卡片点击展开 |
| `06c982c` | V2 R2: 项目详情模态（Digital Resin 完整双语） |
| `77c4c09` | V2 R1: 液态玻璃导航 + 玻璃质感系统 |
| `848937a` | wip(v2): R1 部分 + 交接文档（历史，已被后续覆盖） |
| `a99c6d7` | content: Digital Resin 准确描述 + 完整项目素材（v1.0 指向此） |
| `f2d391b` | docs: V2 需求 |
| `1e8c175` | fix: 中文名更正为 李泽毓（Li Zeyu） |
| `7e19a3a` | V1: personal homepage MVP |

---

## 4. 文件清单与规模（截至 2026-09-08）

| 文件 | 行数 | 说明 |
|---|---|---|
| `index.html` | 233 | 页面结构：navbar（含 Info/Chat 切换）/ hero / about / projects / learning / contact / footer + 模态容器 + 移动菜单 + chat 占位视图 |
| `assets/js/main.js` | 630 | IIFE + ES5 var 风格；i18n 双语词典、PROJECTS 数据、theme/lang/reveal/navbar/modal/expand/viewSwitch 逻辑 |
| `assets/css/styles.css` | 1107 | 主题变量（液态玻璃 tokens）、各区块样式、模态样式、V2.1 视图切换/chat 样式、响应式 |
| `docs/v1-design.md` | 146 | V1 设计文档（需求、信息架构、视觉、验收对照） |
| `docs/v2-design.md` | 133 | V2 设计文档（4 需求、拆分、实现证据、版本记录） |
| `docs/digital-resin.md` | 62 | Digital Resin 完整项目素材（V2 详情数据来源） |
| `docs/v2-progress.md` | 117 | 历史：V2 发起时的交接文档（现已过时，仅存档） |
| `docs/project-progress.md` | 本文件 | 总进度档案 |

---

## 5. 已完成（V1 → V2）

### V1 — MVP（tag `v1.0`）
- 页面结构：Hero / About / Projects / Learning & Interests / Contact / Footer。
- 基础交互：双主题切换、中英文切换、入场 reveal 动画。
- 全部经 PRD 第 16 节验收对照通过。

### V2 — 视觉身份 + 交互升级（tag `v2.0`），四轮迭代
- **R1**（`77c4c09`）液态玻璃：`--glass-*` 主题变量（明/暗）、`body::before` 背景光晕、导航 `.nav-links` 玻璃 pill（含 `.active` 高亮样式）、`.control-btn` 玻璃化、`.navbar.scrolled` 阴影加深、`section` 滚动定位 84px、`.feature-card`/`.project-card` 毛玻璃化。
- **R2**（`06c982c`）项目详情模态：项目卡1 由整卡 `<a>` 改为 `<div data-project>`（内嵌独立 GitHub 链接）+ 模态容器；`main.js` 加 `PROJECTS` 双语数据 + 模态渲染/开关；论坛卡 badge 改"筹备中"。
- **R3**（`8bccf4d`）About 卡片展开：三张 `.feature-card` 加 `data-expand` + `.feature-more` + `.feature-hint`；`initExpand` 点击/键盘切换；`applyLang` 重设已展开卡片 hint。
- **R4**（`1930eb3`）移动端 + scroll spy：汉堡按钮 `#menu-btn`、全屏毛玻璃 `#mobile-menu`、IntersectionObserver scroll spy（含降级）、footer 改 V2.0、768px 断点调整、文件头注释升级 V2.0。
- **R5 收尾**（`123c967`）V2 实现证据记录，tag `v2.0`。

### V2.1 — 修复 + 小特性（`f5e64df`，2026-09-08）
- **修复① navbar 滚动分层**：`.navbar.scrolled` 整条 64px 横条毛玻璃化（复用既有 `--nav-bg` 变量 + blur 20px + 底部 hairline），未滚动时保持透明。
- **修复② 模态字体/遮挡**：去除 `.modal-close` 负 margin 重叠 hack（原 `margin: 14px 14px -48px 0` + `.modal-body margin-top:-44px`），改为正常流内布局（按钮行占位 50px，内容从其下方开始，永不被遮挡）；新增 `.modal-eyebrow` 样式并修正 JS 输出（原 `class="eyebrow"` 无对应 CSS，导致字体不一致）。
- **新增① 摄影特长**：Learning & Interests 第 5 张卡（`learning.i5.*`），文案预留"后期上传个人作品、制作线上画展"。
- **新增② Info/Chat 视图切换**：仿 ChatGPT 顶部 segmented 控件（`.view-switch`，navbar logo 右侧）；`<main id="view-info">` 与原内容、`<main id="view-chat">` 空占位（图标 + 文案 + "V3 敬请期待" badge）；状态机由 `body[data-view]` CSS 驱动（无 JS 也可用）；chat 视图隐藏 info/footer、禁用锚点 pill；≤768px 切换控件收进 `#mobile-menu`；切视图自动关模态/关菜单/回顶。
- **自检**（用户要求提交前必做）：jsc 仅预期 ReferenceError；HTTP 全 200；i18n 56 HTML key 全部命中 zh/en（两词典 68 key 完全对齐）；标签配对平衡；模态遮挡走查（按钮行 50px + 内容 62px 起，滚动重叠仅 6px 且按钮有不透明玻璃底）；769px 临界宽度 navbar 排布核算通过。

---

## 6. V2 四条需求 → 实现映射

| 需求 | 版本 | 状态 | 实现 |
|---|---|---|---|
| ① 作品集详情视图（任务介绍） | V2 | ✅ | 点击项目卡弹出详情模态，展示背景/目标/已完成/技术栈/收尾/未来方向 |
| ① 留言 / 浏览量 / 喜爱量 | V3 | ⏳ 待启动 | 需 Supabase，对应 PRD 第 10 节 |
| ② About 卡片点击展示更多 | V2 | ✅ | 可展开卡片（双语文案，助理拟稿可替换） |
| ③ 顶栏导航液态玻璃 | V2 | ✅ | 玻璃 pill + scroll spy 当前板块高亮 |
| ④ 适当区域毛玻璃 | V2 | ✅ | 卡片/模态/导航统一玻璃语言 + 背景光晕层 |

---

## 7. V2 验证结论（已完成）

- `jsc`：无 SyntaxError（仅预期中的 `document` ReferenceError）。
- HTTP：index.html / styles.css / main.js 全部 200。
- i18n：HTML 全部 49 个 `data-i18n` key 均在 main.js 词典中定义，无遗漏。
- `V1.0` 残留：已全部清理（含文件头注释）。
- 浏览器已打开 `http://localhost:8000/index.html` 供目视复核（交互为 JS 逻辑，已代码审查确认）。

---

## 8. 待办 / 未完成（下次接手）

### 8.1 素材补充（用户侧输入）
- **志愿者论坛小程序「任务介绍」素材**：本人声明尚未建成，卡片状态＝"筹备中（Planning）"，详情暂用 coming-soon 占位。素材补充后填入 `PROJECTS.forum` 数据对象即可。
- **About 卡片扩展文案**：目前为助理根据个人信息陈述拟稿，用户可替换措辞（f1.more / f2.more / f3.more 的中英文）。

### 8.2 功能待启动
- **V3 — 社交互动 + 数据库**：留言、浏览量、喜爱量。需 Supabase 后端 + 公开部署。V2 的 `.modal-stats` 中 `—` 占位即预留槽位，接入后替换为实时数据。另按 PRD 第 10 节含 Feedback 系统。**需与用户确认启动 V3 的时机与部署方案。**
- **V3 — Chat 页面实装**：V2.1 已建 Info/Chat 切换骨架与 `#view-chat` 空占位视图，V3 在此填充真实对话功能。
- **摄影线上画展**：V2.1 已加摄影特长卡占位；待用户提供作品后制作线上画廊。

### 8.3 可选打磨（用户反馈驱动）
- 液态玻璃浓度、抽屉动画时长、间距等视觉细节微调。
- 浏览器交互手感复核（模态开关、卡片展开、移动菜单）——建议用户实际点一遍。

---

## 9. 关键实现细节（接手必读）

- **`main.js` 是 IIFE + ES5 `var` 风格**，新增代码可用 ES6。词典变量 `i18n`（zh/en 两层）。函数：`applyLang` / `applyTheme` / `detectLang` / `detectTheme` / `initReveal` / `initNavbar`（含移动菜单 + scroll spy）/ `initModal` / `initExpand` / `setView` / `initViewSwitch`。
- **真实类名**（务必不要凭记忆假设）：`.project-card-top` / `.project-link` / `.project-tag` / `.badge` / `.feature-card` / `.interest-card` / `.contact-item` / `.view-switch-btn` / `.modal-eyebrow`。**不存在** `.note` / `.contact-card` / `.eyebrow`。
- 项目卡1 是 `<div class="project-card reveal" data-project="resin" ...>`，**不是**整卡 `<a>`（V2 已改）。
- 论坛卡：`data-project="forum"`，badge key＝`projects.status.planning`（筹备中/Planning）。
- 模态容器：`#project-modal`（`.modal-overlay`）内 `#modal-body` 由 JS 渲染；`#modal-close` 关闭。V2.1 起关闭按钮为正常流内 sticky 布局，**不要**恢复负 margin 重叠写法。
- 视图切换（V2.1）：`body[data-view="info|chat"]` 驱动，`#view-info` / `#view-chat` 两个 `<main>`；`.view-switch` 控件桌面在 navbar、移动在 `#mobile-menu`；chat 视图下锚点链接点击会先 `setView("info")`。
- 移动端：`#menu-btn`（汉堡）+ `#mobile-menu`（全屏菜单），768px 断点显示。
- Digital Resin 详情数据源：`docs/digital-resin.md` + `main.js` 的 `PROJECTS.resin`（zh/en）。

---

## 10. 工具与流程教训（重要）

1. **禁止凭记忆构造 `edit` 的 oldString**：改任何文件前必须先 `read` 拿到真实内容。旧模型曾因假设存在 `.note`/`.contact-card`/`.card-link` 等类名、padding 记错，导致多次 edit 失败。
2. **同一文件在一条消息里并行多个 edit/write 会整批被 abort**（曾 5/5、1/1 全 abort），`read` 则不报错。若遇 abort：改为单发，或 read+write 全量写入。
3. `.opencode/skills/` 为 DeepWorks 工具目录，**永不提交**到本项目 git。
4. 产物规范：用户可见交付物放 `outputs/` 或 `docs/`，临时文件放 `.deepworks/tmp/`。

---

## 11. 文档关系说明

- `docs/v1-design.md` — V1 设计（已完成，作为历史）。
- `docs/v2-design.md` — V2 设计 + 实现证据记录（当前有效）。
- `docs/project-progress.md` — **本文件，承担"总进度"职能，以后恢复任务优先读这里**。
- `docs/v2-progress.md` — V2 发起时的交接文档（**已过时**，仅存档，勿作为依据；真正的状态以本文件 + v2-design.md 为准）。
- `docs/digital-resin.md` — Digital Resin 项目素材（V2 详情数据来源）。
