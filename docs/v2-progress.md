# V2 进度交接文档（模型切换存档点）

> 存档时间：2026-09-03
> 存档原因：用户切换模型，暂停 V2 开发
> 恢复方式：新模型读本文件 + `docs/v2-design.md` + 三个源文件，从"当前状态"继续

---

## 1. 当前状态一览

| 项 | 状态 |
|---|---|
| V1 | ✅ 完成，tag `v1.0`（指向 commit `a99c6d7`，内容准确版） |
| V2 需求 | ✅ 已收录于 `docs/v2-design.md`（4 条，需求①拆分为 V2 详情视图 + V3 互动数据） |
| Digital Resin 素材 | ✅ `docs/digital-resin.md`（原文完整，详情页内容源） |
| 论坛小程序素材 | ⏳ 未提供；项目未建成 → 状态须标"筹备中"，详情显示筹备提示 |
| V2-R1 玻璃视觉系统 | 🔶 **进行中（约 70%）**，未提交部分见 §3 |
| V2-R2 项目详情模态 | ⬜ 未开始，实施方案见 §4 |
| V2-R3 About 卡片展开 | ⬜ 未开始，实施方案见 §5 |
| V2-R4 移动菜单+scroll spy | ⬜ 未开始，实施方案见 §6 |
| 预览服务器 | `python3 -m http.server 8000` 可能仍在运行（日志 `.deepworks/tmp/v1-preview.log`） |

## 2. 工作区 git 状态

- 最新 commit：`a99c6d7`（V1 内容修正），tag `v1.0` 也在此
- `assets/css/styles.css` 有 **R1 已完成的 6 项改动未提交**（见 §3-A）
- `.opencode/skills/` 两个目录**永远不要提交**（工具目录）
- 存档动作：本文件 + styles.css WIP 一起 commit（WIP 标记），**不打 tag**

## 3. R1 剩余工作（玻璃视觉系统）

### A. 已完成（在工作区 styles.css 中，未 commit）
1. 主题变量玻璃化：`--glass-bg/--glass-border/--glass-shadow/--glass-highlight/--glass-shadow-strong/--glow-1/--glow-2`（light+dark 双套）；`--bg-elevated` 改为半透明 rgba；`--divider` 改半透明
2. `body::before` 固定背景微光斑（毛玻璃的折射层次来源）
3. `.nav-links` 液态玻璃 pill（含 `a.active` 高亮样式，供 R4 scroll spy 使用）
4. `.navbar` 不再整条毛玻璃；`.navbar.scrolled .nav-links/.control-btn` 阴影加深
5. `.control-btn` 玻璃化
6. `.nav-inner` 高度 64px；CSS 头部注释已是 V2.0

### B. 待做（2 处小改，基于真实文件 605 行版）
1. 第 97 行附近：`section { scroll-margin-top: 64px; }` → `84px`
2. `.feature-card`（约 405 行）和 `.project-card`（约 437 行）：
   - `border: 1px solid var(--divider)` → `var(--glass-border)`
   - 增加 `-webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px);`
   - 注意：两个卡片真实选择器是 `.feature-card` / `.project-card`；**不存在** `.note`/`.contact-card`（学习区是 `.interest-card` 顶部 accent 边线风格，不加玻璃；联系区是 `.contact-item` 列表式，不加玻璃）

完成后 commit：`V2 R1: liquid glass nav pill + frosted card surfaces + background glow`

## 4. R2 实施方案（项目详情模态视图）

### index.html 改动
- 项目卡1（当前是**整卡 `<a class="project-card">` 链 GitHub**）改为：
  `<div class="project-card reveal" data-project="resin" role="button" tabindex="0">`，内部底部：
  `<div class="project-card-foot"><a class="project-link" href="GitHub地址" target="_blank" rel="noopener noreferrer">GitHub <span class="arrow">→</span></a><span class="card-hint" data-i18n="projects.hint">查看详情</span></div>`
- 项目卡2：`data-project="forum"`、badge 改 `data-i18n="projects.status.planning">筹备中`、foot 为 `<span class="project-tag">…</span>` + hint
- `</main>` 后、script 前加模态容器：
  `<div class="modal-overlay" id="project-modal" aria-hidden="true"><div class="modal-panel" role="dialog" aria-modal="true"><button class="modal-close" id="modal-close">×</button><div class="modal-body" id="modal-body"></div></div></div>`

### main.js 改动（保持 IIFE；新代码可用 ES6）
- i18n 新 key（zh/en）：`projects.status.planning` 筹备中/Planning；`projects.hint` 查看详情/Details；`modal.eyebrow` 项目详情/Project Detail；`modal.views` 浏览量/Views；`modal.likes` 喜爱量/Likes；`modal.statsNote` 互动数据将在 V3 上线后激活/Stats go live in V3；`modal.sec.background/goals/done/stack/next/future` 项目背景/项目目标（MVP 阶段）/已完成工作/技术栈/MVP 收尾计划/未来扩展方向（en: Background/Goals (MVP)/Completed/Tech Stack/MVP Wrap-up/Future Directions）；`modal.comingSoon` 项目详情筹备中，敬请期待/Details coming soon.
- `PROJECTS` 数据对象 `{resin: {zh, en}, forum: {zh, en}}`：resin 完整内容取自 `docs/digital-resin.md`（background 段落、goals 5 条、done 6 条、stack 5 行、next 3 条、future 7 条 + stage "MVP 阶段"/"MVP Stage" + github 链接）；forum 仅 name/badge/desc/note
- resin 英文翻译（已定稿，直接用）：
  - background: "In water treatment, ion exchange resins are widely used to remove cations (Na⁺, Ca²⁺, Mg²⁺, heavy metals). Resin screening, process optimization and performance prediction have relied on wet experiments — slow, costly, and hard to scale across variable combinations. AI for Science opens a new path: a digital twin that simulates adsorption in silico — resin parameters and operating conditions in, adsorption performance prediction out."
  - goals: 1) Build molecular models of resin functional groups and target ions; 2) Compute ion–functional-group binding energies with a machine-learned potential; 3) Generate pore structures and estimate porosity and effective diffusivity; 4) Solve the diffusion–adsorption equation with physics-informed neural networks; 5) Output adsorption kinetics and isotherms — a minimum viable digital twin.
  - done: RDKit styrene-sulfonate + Na⁺ structures; MACE-MP-0 optimization, binding energy −264.6 kJ/mol; Boolean-model 2D pores, porosity 0.343; Bruggeman → effective diffusivity; DeepXDE 1D diffusion–adsorption with Langmuir term; reasonable kinetics curve extracted.
  - stack: Molecular building — RDKit, ASE / Micro-scale energetics — MACE-MP-0 / Pore generation — Boolean stochastic geometry / Meso-scale simulation — PINNs (DeepXDE) / Numerics & plotting — NumPy, Matplotlib
  - next: Generate adsorption isotherms; Unified entry script main.py; Code cleanup & docs → deliverable MVP.
  - future: More ions & temperature; Dual-scale pore model (Cox Boolean) or experimental PSD; Column model & breakthrough curves; Regeneration simulation; Sensitivity analysis; Streamlit UI; Experimental data + active learning → AI-Agent closed loop.
- 逻辑：`openProjectModal(id)` 渲染+锁定 body 滚动；`closeProjectModal()`；点击卡片（忽略 `e.target.closest("a")`）、Enter/Space 键、ESC、点遮罩关闭；`applyLang` 末尾加 `if (openProjectId) renderProjectModal(openProjectId)`

### styles.css 追加
- `.project-card { cursor: pointer; }`；`.project-card-foot { display:flex; justify-content:space-between; align-items:center; }`
- `.card-hint` 13px accent 色，默认 opacity 0/位移，`.project-card:hover .card-hint` 显现
- 模态全套：`.modal-overlay`（fixed、rgba(15,20,27,.45)、blur 12px、opacity/visibility 过渡）、`.modal-panel`（max-width 780px、max-height 85vh、overflow auto、var(--bg-elevated) + blur 28px、radius 24px、translateY(24px)→0）、`.modal-close`（sticky 右上、玻璃圆钮）、`.modal-body`（padding 40px 44px 48px）、`.modal-title`、`.modal-meta`（badge+stage chip+GitHub link）、`.modal-stats`（stat pill：标签+`—` 占位 + stat-note）、`.m-sec h3`（serif 19px + accent 左竖条）、`.stack-row`（两列网格：模块/工具）

完成后 commit：`V2 R2: project detail modal with full Digital Resin content (bilingual)`

## 5. R3 实施方案（About 卡片点击展开）

- 每张 `.feature-card` 加 `data-expand` + `tabindex="0"`，内部末尾加：
  `<div class="feature-more"><p data-i18n="about.f1.more">…</p></div><span class="feature-hint" data-i18n="about.hint">点击了解更多 ▾</span>`
- i18n：`about.hint` 点击了解更多 ▾/Click for more ▾；`about.hintLess` 收起 ▴/Show less ▴；扩展文案（已定稿）：
  - f1.more zh：习惯把零散知识点整理成结构化笔记，对细节敏感，会主动梳理知识之间的关联——把"拆解复杂"变成可复用的方法。
  - f1.more en: I turn scattered knowledge into structured notes, stay sensitive to details, and map how concepts connect — turning "breaking down complexity" into a reusable method.
  - f2.more zh：专业课学习、科研项目与学生工作三线并行：以课程打牢数理基础，以科研（如 Digital Resin）锻炼方法，以学生工作磨练协作与执行。
  - f2.more en: Coursework, research, and student leadership in parallel — courses build my foundation, research (e.g., Digital Resin) sharpens method, and student work trains execution.
  - f3.more zh：以海外申研为中期目标，持续积累履历与英文能力；长期希望进入金融行业——目标清晰，路径明确。
  - f3.more en: Mid-term: building credentials and English for graduate applications abroad; long-term: a career in finance — a clear goal with a defined path.
- JS：点击/Enter 切换 `.expanded`；hint 文案展开时换 hintLess；applyLang 时对已展开卡片重设 hintLess
- CSS：`.feature-more { max-height:0; opacity:0; overflow:hidden; transition }`、`.expanded .feature-more { max-height:240px; opacity:1; margin-top:14px }`、`.feature-hint` hover 显现、`.expanded` 卡片 border-color accent

完成后 commit：`V2 R3: expandable about cards with extended personal content`

## 6. R4 实施方案（移动菜单 + scroll spy + 响应式）

- nav-inner 加汉堡按钮 `.menu-btn`（两横线，<768px 显示；`.nav-links` 隐藏断点从 560px 上移到 768px）
- `.mobile-menu` 全屏毛玻璃覆盖层（4 个 serif 大链接，复用 nav.* i18n key），点链接后关闭
- scroll spy：IntersectionObserver（rootMargin "-45% 0px -50% 0px"）监听 4 个 section，命中时给对应 `.nav-links a` 加 `.active`（R1 已备好样式）；hero 命中时清除所有
- footer 文案与 i18n `footer.text`：`V1.0` → `V2.0`

完成后 commit：`V2 R4: mobile menu, scroll spy, responsive polish`

## 7. 收尾（全部轮次后）

1. 验证：`curl -s -o /dev/null -w "%{http_code}" localhost:8000/{index.html,assets/css/styles.css,assets/js/main.js}` 全 200；jsc 无 SyntaxError；grep 无 `V1.0` 残留（除文档）
2. 更新 `docs/v2-design.md`：四轮完成记录（每轮问题→改动→理由，PRD 第 9 节证据要求）
3. commit 文档；`git tag -a v2.0 -m "V2 — glass visual system, project detail modal, expandable cards, mobile interactions"`
4. 向用户汇报 + 提醒：论坛素材待补（补后填入 PROJECTS.forum 即可）；About 扩展文案为助理拟稿可替换

## 8. 工具使用教训（重要）

- **禁止凭记忆构造 edit 的 oldString**：本文件因旧模型凭记忆写匹配串（如假设存在 `.note`/`.contact-card`/`.card-link` 类、padding 值记错）导致多次失败。改任何文件前**必须先 read 拿到真实内容**。
- 一次消息内并行多个 edit/write 到同一文件时，运行时曾整批 abort（5/5、1/1 均 aborted），read 则正常。若遇 abort：重试单发；仍失败则用 read+write 全量写入。
- 文件真实结构（2026-09-03 read 确认）：
  - `index.html` 167 行：项目卡1是整卡 `<a>`（R2 必须改 div）、badge key 是 `projects.status.inprogress`、论坛卡有 `projects.p2.tag`（微信小程序）
  - `main.js` 204 行：IIFE + ES5 var 风格、`i18n` 词典变量、函数 applyLang/applyTheme/detectLang/detectTheme/initReveal/initNavbar；新增代码可 ES6
  - `styles.css` 605 行（含 R1 未提交改动）：真实类名 `.project-card-top`/`.project-link`/`.project-tag`/`.badge`/`.feature-card`/`.interest-card`/`.contact-item`
