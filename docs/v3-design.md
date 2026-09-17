# V3 设计文档 — Nick Lee Personal Homepage

> 版本：V3-Design-01
> 日期：2026-09-17
> 阶段：V2.2 完成 → V3 构建启动
> 输入：PRD 第 10 节（V3 需求）+ 本人 2026-09-17 拍板的 4 项决策

---

## 1. V3 目标（PRD 原文）

> 将网站从 Personal website 变成 **Public product**。

PRD 硬性要求：公开部署（V3.1）、Feedback 系统（V3.2，免登录 + 明确成功提示）、Supabase 后端（V3.3）、安全与隐私（V3.4）、≥3 人真实用户测试（V3.5）。

## 2. 本人决策记录（2026-09-17 已拍板）

| 决策点 | 结论 |
|---|---|
| V3 范围 | **含项目互动数据**：留言 / 浏览量 / 喜爱量，与 Feedback 同批实现，复用同一 Supabase 后端（PRD「One Type of Problem at a Time」） |
| 部署平台 | **双平台部署**（2026-09-17 修订）：**Cloudflare Pages 主站**（国内访问更稳、内置 Web Analytics、Final 阶段 Workers 可代理 LLM API）+ **GitHub Pages 镜像备份**（与仓库一体）；用户测试时选用更稳定的链接。anon key 硬编码，安全性由 RLS 保证，见 §7 |
| Chat 页面 | **保持 V2.2 静态布局**，真实对话留到 Final Extension（对接 PRD Option C 知识库问答） |
| Supabase | 本人已注册账号，项目创建与配置按 §9 指引执行 |

## 3. 架构总览

```
Visitor
   ↓ HTTPS
Cloudflare Pages 主站 / GitHub Pages 镜像（同一 GitHub 仓库自动部署）
   ↓ supabase-js（anon key，仅前端可公开密钥）
Supabase
   ├── feedback 表      → 仅可插入（RLS），本人控制台查看
   ├── comments 表      → 可插入 + 可读（RLS）
   └── project_stats 表 → 可读；写入仅经 RPC 原子自增（RLS 禁直改）
```

无自建服务器、无环境变量依赖 —— 与纯静态技术栈一致，不引入构建步骤。

## 4. 数据库设计（Supabase / Postgres）

完整可执行脚本见 `docs/v3-supabase-setup.sql`，设计要点：

### 4.1 `feedback`（PRD V3.2）
| 列 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | bigint identity | PK | |
| content | text | 必填，1–2000 字 | 反馈正文 |
| contact | text | 可空，≤200 字 | 联系方式（**可选**，PRD V3.4 不收集非必要信息） |
| lang | text | zh/en | 提交时的界面语言 |
| page | text | 可空 | 来源锚点（便于归类） |
| created_at | timestamptz | default now() | |

**RLS**：anon 仅 `INSERT`；**无 SELECT 策略** → 访客互不可见，反馈只有本人在 Supabase 控制台可见（隐私保护）。

### 4.2 `comments`（项目留言）
| 列 | 类型 | 约束 |
|---|---|---|
| id | bigint identity | PK |
| project_id | text | FK → project_stats，必填 |
| nickname | text | 1–30 字，默认「访客」 |
| content | text | 1–500 字 |
| created_at | timestamptz | default now() |

**RLS**：anon 可 `INSERT` + `SELECT`（公开留言墙）；不可改/删。

### 4.3 `project_stats`（浏览量 / 喜爱量）
| 列 | 类型 | 约束 |
|---|---|---|
| project_id | text | PK（'resin' / 'forum'，种子数据预置） |
| views / likes | integer | ≥0，default 0 |
| updated_at | timestamptz | |

**RLS**：anon 仅 `SELECT`；禁止直接写。计数更新只走 `security definer` RPC：
- `increment_views(project_id)` → 原子 upsert +1，返回新值
- `increment_likes(project_id)` → 同上

访客无法把计数改成任意值，只能 +1（可接受的滥用面；前端另有防刷，见 §6.3）。

## 5. Feedback 系统设计（前端）

- **入口**：新增独立 `#feedback` 板块（联系区之后），导航栏第 5 项「反馈 / Feedback」（含移动端菜单 + scroll spy 注册）。
- **表单**：反馈内容 textarea（必填）+ 联系方式 input（可选，标注"可不填"）+ 提交按钮；沿用玻璃质感组件语言。
- **状态机**：`idle → submitting（按钮禁用 + 文案"提交中"）→ success（明确成功提示 ✅ PRD 硬要求，表单清空，提示 5s 后淡出）/ error（失败原因 + 可重试）`。
- **免登录**（PRD 硬要求）：supabase-js anon 直连，无 auth 流程。
- **honeypot**：隐藏 input（真人不可见），有值则静默拦截机器人。

## 6. 项目互动数据设计（前端）

### 6.1 浏览量
- `openProjectModal(id)` 时：sessionStorage 无 `viewed:<id>` → 调 `increment_views` → 写入标记（**每会话每项目计 1 次**，防刷新刷量）。
- 返回值写入 `.modal-stats` 浏览量 pill（替换 V2 预留的 `—` 占位）。

### 6.2 喜爱量
- `.modal-stats` 喜爱量 pill 变为可点按钮（心形 SVG + 计数）。
- localStorage `liked:<id>`：未点 → 点击调 `increment_likes`，按钮变实心态；已点 → 点击提示"已喜爱过"（**单向点赞，MVP 不支持取消**）。
- 进入模态时 `SELECT` 拉取最新计数渲染。

### 6.3 留言
- 模态内 stats 下方新增评论区：留言列表（昵称 + 相对时间 + 内容，按时间倒序，首屏 20 条）+ 昵称 input（可空，默认"访客"）+ 内容 textarea + 提交。
- 提交成功即插入列表顶部（乐观渲染），失败回滚提示。
- 防刷：honeypot + 前端 30s 频率限制 + DB 长度 check（§4.2）。

## 7. 安全与隐私（PRD V3.4 对照）

| 要求 | 落实 |
|---|---|
| 不暴露 secret keys | 前端仅 anon public key（Supabase 官方设计为可公开，安全性由 RLS 保证）；service key 永不出现。GitHub Pages 无环境变量机制，anon key 硬编码于 `main.js` 顶部常量 —— 这是 Supabase 纯前端应用的标准做法 |
| 不收集非必要个人信息 | feedback 联系方式可选；留言昵称可空；无 Cookie、无追踪脚本 |
| 检查公开页面与数据库权限 | RLS 三表策略如上；上线后用匿名身份实测：可读 stats/comments、可插入、**不可读他人 feedback、不可直改计数** |
| 传输安全 | GitHub Pages + Supabase 均强制 HTTPS |

## 8. 部署方案（双平台：Cloudflare Pages 主站 + GitHub Pages 镜像）

> 2026-09-17 修订：由 GitHub Pages 单平台改为双平台。理由——Cloudflare 国内访问更稳（V3.5 测试访客以国内师生为主，github.io 域名国内经常被干扰是最大风险）；内置 Web Analytics（免费、无 Cookie，直接服务用户测试）；Final 阶段 Workers 可代理 LLM API key（Chat 接 LLM 的现成拼图）。GitHub Pages 保留作镜像备份，两站同源同内容。

### 8.1 共同前提
1. GitHub 网页新建 **public** 仓库（建议名 `personal-homepage`），本地 `git remote add origin` + push `main`。
2. 仓库根添加空文件 `.nojekyll`（跳过 Jekyll 处理，保护纯静态结构；对 Cloudflare 无害）。

### 8.2 Cloudflare Pages（主站）
1. 注册/登录 [dash.cloudflare.com](https://dash.cloudflare.com) → 左侧 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。
2. 授权 GitHub，选中 `personal-homepage` 仓库。
3. 构建设置：Framework preset 选 **None**，Build command **留空**，Output directory 填 `/`（根目录）——纯静态无构建。
4. **Save and Deploy**，此后每次 push `main` 自动部署。站点地址：`https://<project>.pages.dev`。
5. 可选：左侧 **Web Analytics** 一键开启（隐私友好，无 Cookie 横幅负担），供 V3.5 观测访问量。

### 8.3 GitHub Pages（镜像备份）
1. 仓库 **Settings → Pages** → Source: **Deploy from a branch** → `main` / `/ (root)`。
2. 站点地址：`https://leesirleesirlee-star.github.io/<repo>/`（资源均为相对路径，子路径部署无碍）。

### 8.4 发布后验收（两站各过一遍）
双语 / 双主题 / 模态 / 移动菜单 / chat 视图 / **Feedback 真机提交全链路** + RLS 匿名权限实测（可读 stats/comments、可插入、不可读他人 feedback、不可直改计数）。V3.5 发测试链接时优先发 Cloudflare 地址，GitHub 地址作备用。

## 9. 实施轮次（沿用 V2 迭代纪律 + PRD 第 9 节证据要求）

| 轮次 | 内容 | 依赖 |
|---|---|---|
| **R1 地基** ✅ 本轮 | 本设计文档 + `v3-supabase-setup.sql` + Supabase 项目创建（本人操作，见聊天内指引） | 无 |
| **R2 Feedback 前端** ✅ 2026-09-17 | 导航第 5 项 + #feedback 板块 + 表单状态机 + supabase-js 接入 + honeypot | R1 的 URL + anon key |
| **R3 互动数据** | views/likes 激活 modal-stats + 留言 UI + 防刷 | R2 的客户端封装 |
| **R4 部署**（进行中） | GitHub 仓库 + Cloudflare Pages（主站）+ GitHub Pages（镜像）+ .nojekyll + 双站全链路回归 | R3 完成 |
| **R5 测试收尾** | ≥3 人真实测试（3–5 条 meaningful feedback）+ 反馈分类记录 + 证据截图 + 更新总进度档案 + tag `v3.0` | R4 上线 |

每轮独立 commit（git checkpoint），证据记录于本文档 §10（逐轮回填）。

## 10. V3 实现记录（逐轮回填）

- **R1（2026-09-17）**：V3 决策拍板（范围/平台/Chat/Supabase）；产出 `docs/v3-design.md` + `docs/v3-supabase-setup.sql`；`.gitignore` 增加 `uploads/`、`.opencode/skills/`（防误发布）；V2.2（毛玻璃调优 + Chat 静态布局）先行 commit `38d362d`。
- **R2（2026-09-17）**：Feedback 前端完成（`3b0ff81`）。supabase-js v2.116.0 本地化 `assets/vendor/`；导航第 5 项「反馈」+ `#feedback` 板块（内容必填 + 联系方式可选 + honeypot）；提交状态机三态（submitting/success 5s 淡出/error）双语；scroll spy 注册；anon key 硬编码 `main.js`（可公开密钥）。后端 curl 七项验证全过；浏览器真实提交验收通过（记录落库确认）。
- **R4-进行中（2026-09-17）**：GitHub 仓库创建（`leesirleesirlee-star/Leesir-s-personal-homepage`）并完成首推（SSH）。推送前安全处置：① git 历史重写，从历史彻底移除 2 个个人 rtf（PRD/个人信息陈述）+ `.opencode/` 工具目录（26 commits 完整、v1.0/v2.0 tags 跟随重写；PRD 由 textutil 全文备份重建，个人陈述原件待本人从其他渠道恢复）；② 11 项敏感信息终审全绿（无私密凭据/手机号/身份证/本地路径/EXIF；anon key 与邮箱属设计公开）；③ `.gitignore` 加固（`.opencode/` 整目录 + 两个 rtf 永不入库）。剩余：Cloudflare Pages 主站配置 + GitHub Pages 开启 + 双站回归。

## 11. 版本记录

| 版本 | 日期 | 内容 |
|---|---|---|
| V3-Design-01 | 2026-09-17 | 收录 PRD V3 需求 + 本人 4 项决策；数据库/RLS/RPC 设计定稿；五轮实施计划 |
| V3-Design-02 | 2026-09-17 | 部署平台修订：GitHub Pages 单平台 → **双平台部署**（Cloudflare Pages 主站 + GitHub Pages 镜像）；§2/§3/§8/§9 同步更新 |
| V3-Design-03 | 2026-09-17 | §9/§10 回填：R2 完成验收；R4 启动（GitHub 首推 + 历史清理 + 敏感信息终审） |
