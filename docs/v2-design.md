# V2 设计文档 — Nick Lee Personal Homepage

> 版本：V2-Design-01
> 日期：2026-09-03
> 阶段：V1 验收通过 → V2 需求收集
> 输入：本人 2026-09-03 提出的 4 条 V2 更新方向 + PRD 第 9 节 V2 需求方向

---

## 1. V2 目标（PRD 原文）

> 从 "A website that works" 变成 "A website that feels like my work."

V2 聚焦四个方向：视觉身份（V2.1）、内容重组（V2.2）、交互（V2.3）、响应式（V2.4）。

## 2. 本人提出的 V2 更新方向（2026-09-03）

### 需求① 作品集（Works / Portfolio）

**原始描述**：类似已有的 Projects 模块，但打开可以查看相关任务介绍，以及留言；类似 GitHub 仓库，可呈现浏览量和喜爱量。

**拆解与版本归属**：

| 子功能 | 版本 | 实现思路 | 依赖 |
|---|---|---|---|
| 项目详情视图（点开查看任务介绍） | **V2** | 点击项目卡片 → 打开详情（模态层或独立子页），展示项目背景、任务内容、进展记录 | 纯前端，无依赖 |
| 留言（访客对项目评论） | **V3** | Supabase 数据库存储，与 PRD V3.2 Feedback 系统同批实现、复用同一后端 | 需要数据库 + 公开部署 |
| 浏览量（View count） | **V3** | Supabase 计数，进入详情时 +1 | 需要数据库 |
| 喜爱量（Like / 点赞） | **V3** | Supabase 计数 + 防重复（localStorage 标记） | 需要数据库 |

**拆分理由**：PRD 第 8 节明确 V1 不做数据库，第 10 节（V3）才引入 Supabase 后端。留言/浏览量/喜爱量本质都是"访客数据写入"，与 Feedback 系统是同一类问题，放 V3 一起解决最干净，也符合"One Type of Problem at a Time"原则。V2 先把详情视图的交互和信息架构做好，V3 接入数据后自然激活。

**待确认**：项目详情里展示什么内容？建议每个项目包含：项目背景 / 我的角色与任务 / 当前进展 / 收获与思考。请本人后续为 Digital Resin 和志愿者论坛小程序各提供一段"任务介绍"素材。

### 需求② About 卡片点击展现更多信息

**原始描述**："关于我"部分卡片悬浮后点击应该展现更多信息。

**版本归属**：**V2**（属 V2.3 Interaction 的 micro-interactions）。

**实现思路**：
- hover：卡片浮起 + 出现"点击了解更多"提示（解决"用户不知道卡片可点"的可用性问题）
- 点击：卡片原地展开（accordion 式）或翻转（flip），展示扩展内容；再次点击收起

**内容来源（建议，待确认）**：用《个人信息陈述》中的素材扩展——
- "逻辑严谨" → 展开：习惯把零散知识点整理成结构化笔记，对细节敏感，主动梳理知识之间的关联
- "科研与实践并行" → 展开：如何平衡专业课学习、科研项目和学生工作（来自常见问题①，需本人写一段答案）
- "目标明确" → 展开：申研规划与时间线、未来金融方向的目标（需本人确认可公开的程度）

### 需求③ 顶栏导航液态玻璃效果

**原始描述**：顶栏上方四个选项按钮应该与页面做区分，比如用一个液态玻璃效果。

**版本归属**：**V2**（V2.1 视觉身份升级）。

**实现思路**（CSS 模拟苹果 Liquid Glass 质感）：
- 四个导航链接收进一个 pill 形容器，与页面背景拉开层级
- 容器：半透明背景 + `backdrop-filter: blur + saturate` + 细腻的内阴影高光（模拟玻璃边缘反光）+ 1px 半透边框
- hover 单个链接时高光跟随，当前所在板块链接高亮（滚动监听 scroll spy）

### 需求④ 页面适当区域毛玻璃效果

**原始描述**：页面整体可以在适当区域做毛玻璃效果。

**版本归属**：**V2**。

**实现思路**：
- 应用区域：项目卡片、About 扩展卡片、联系区、项目详情模态层
- 注意：毛玻璃在纯色背景上无视觉效果，需先为页面加入克制的背景层次（如极浅的渐变/网格纹理/数理元素装饰，保持学院风）
- 与需求③形成统一的"玻璃质感"视觉语言

## 3. PRD 既有 V2 方向（并行推进）

| 方向 | 内容 | 与新增需求的关系 |
|---|---|---|
| V2.1 视觉身份 | 字体系统、色彩、间距、组件层级 | ③④归入此项 |
| V2.2 内容重组 | About/Education/Projects/Skills/Learning/Interests/Goals | ①②的详情与扩展内容归入此项 |
| V2.3 交互 | hover、smooth scrolling、micro-interactions、subtle animations | ②③归入此项；苹果式滚动叙事（V1 遗留）也在此项 |
| V2.4 响应式 | Desktop → Tablet → Mobile | 独立推进 |

## 4. V2 Evidence 要求（PRD 第 9 节）

每次重要修改保留：Before/After 截图、Git checkpoint、修改说明、修改理由。
V2 要求**多轮**有目的的迭代，而非一次性改色改字。

## 5. 待本人提供的素材清单

1. ~~Digital Resin 项目"任务介绍"~~ **已提供（2026-09-03）**，完整素材见 `docs/digital-resin.md`；V1 卡片描述已同步修正为准确版本
2. 志愿者论坛小程序"任务介绍"一段（背景、你的角色、功能、进展）— 待提供
3. 常见问题①"如何平衡专业课学习、科研项目和学生工作"的一段回答（About 卡片扩展内容，可选）
4. 申研规划可公开的程度（About 第三张卡片扩展内容，可选）

## 6. V2 实现记录（2026-09-03 完成）

> V2 按四轮有目的的迭代完成（R1→R4），每轮独立 commit + git checkpoint，遵循 PRD 第 9 节证据要求。

### 6.1 素材落实情况
- Digital Resin 任务介绍素材：**已由本人提供**，完整存档在 `docs/digital-resin.md`（离子交换树脂数字孪生模型 MVP 阶段）。已用于 R2 项目详情模态的完整双语内容。
- 志愿者论坛小程序：本人明确**尚未建成**，故卡片状态设为"筹备中（Planning）"，详情暂展示 coming-soon 占位，待素材补充后填入 `PROJECTS.forum`。
- About 卡片扩展内容（素材 3/4）：按本人已提供的个人信息陈述拟稿实现（可随时替换）。

### 6.2 四轮迭代与 git checkpoint

| 轮次 | Commit | 说明 | Evidence |
|---|---|---|---|
| R1 | `77c4c09` | 液态玻璃导航 pill + 玻璃质感系统 + 背景光晕 | styles.css：玻璃 CSS 变量（light/dark）、body::before 光晕、.nav-links pill（含 .active 样式）、.control-btn 玻璃化、.navbar.scrolled 阴影加深、section scroll-margin 84px、.feature-card/.project-card 毛玻璃化 |
| R2 | `06c982c` | 项目详情模态视图 | index.html：项目卡1 由整卡 `<a>` 改 `<div data-project>`（内嵌独立 GitHub 链接）+ 模态容器；main.js：PROJECTS 双语数据、模态渲染/开关、i18n 新增 key；styles.css：.modal-overlay/.modal-panel/.modal-close/.m-sec/.stack 全套样式；论坛卡 badge 改"筹备中" |
| R3 | `8bccf4d` | About 卡片点击展开 | index.html：三张 feature-card 加 data-expand + .feature-more + .feature-hint；main.js：initExpand 点击/键盘切换、applyLang 重设已展开卡片 hint；styles.css：max-height 展开动画、hint 显现、expanded 强调边框 |
| R4 | `1930eb3` | 移动菜单 + scroll spy + 响应式 + footer V2.0 | index.html：menu-btn、mobile-menu 覆盖层、footer V2.0；main.js：initNavbar 增加移动菜单开关、IntersectionObserver scroll spy（含降级）；styles.css：汉堡按钮、全屏毛玻璃菜单、768px 断点调整、文件头注释 V2.0 |

### 6.3 验证结论（静态 + jsc + HTTP）
- `jsc assets/js/main.js`：**无 SyntaxError**（仅非浏览器环境的 `document` ReferenceError，属预期）。
- `curl localhost:8000/{index.html,assets/css/styles.css,assets/js/main.js}`：**全部 200**。
- i18n 配对校验：HTML 中全部 49 个 `data-i18n` key 均在 main.js 词典（zh/en）中定义，**无遗漏**。
- `grep V1.0`（index.html + assets/）：已全部清理（含文件头注释，均已升级 V2.0）。
- 浏览器（DeepWorks Browser）已打开 `http://localhost:8000/index.html` 供本人目视复核视觉与交互效果（模态/展开/移动菜单为 JS 交互逻辑，已通过代码审查确认）。

### 6.4 需求 → 实现映射
- 需求①（作品集详情视图）：R2 项目详情模态——点击项目卡弹出完整详情（背景/目标/已完成/技术栈/收尾/未来方向），社交媒体互动字段显示"—"占位，**留言/浏览量/喜爱量仍归 V3**（需 Supabase，PRD 第 10 节）。
- 需求②（About 卡片点击展示更多）：R3 可展开卡片。
- 需求③（顶栏导航液态玻璃）：R1 液态玻璃 pill + scroll spy 当前板块高亮（R4 完成 scroll spy）。
- 需求④（适当区域毛玻璃）：R1 卡片毛玻璃 + R2 模态毛玻璃 + R1 body 背景光晕层，形成统一玻璃视觉语言。

### 6.5 V3 预留接口（后续扩展）
- 留言/浏览量/喜爱量：`renderProjectModal` 中 `.modal-stats` 的 `—` 占位即预留槽位，V3 接入 Supabase 后替换为实时数据。
- 论坛项目详情：`PROJECTS.forum` 数据对象已预留结构，素材补充后直接填入。

## 7. 版本记录

| 版本 | 日期 | 内容 |
|---|---|---|
| V2-Design-01 | 2026-09-03 | 收录本人 4 条 V2 方向；需求①拆分为 V2（详情视图）+ V3（留言/浏览量/喜爱量）；确认③④为液态玻璃视觉语言 |
| V2-Impl | 2026-09-03 | R1→R4 全部完成并合入 main；四轮独立 commit + git checkpoint；静态/jsc/HTTP/i18n 校验通过；tag `v2.0` |
