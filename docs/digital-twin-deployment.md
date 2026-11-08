# 数字分身部署与联调说明

## 1. 当前实现

- 传输：正式站点优先走同源 `https://<站点>/api/supabase/...`（Cloudflare Pages Function 反代），失败后依次回退 `*.functions.supabase.co` 与 `*.supabase.co`。浏览器不再把 Supabase 域名作为唯一入口。
- 文本：`浏览器 → 同源反代 / digital-twin-chat → 火山方舟 Chat API`。
- 语音：`MediaRecorder 短录音 → 同源反代 / digital-twin-voice → 火山 ASR（volc.seedasr.auc）→ 方舟文本模型 → 火山 TTS V3 → MP3 播放`。
- 任意文字回答：点击朗读键时调用 `digital-twin-tts`，按需生成 MP3；不再依赖浏览器 `speechSynthesis`。
- 录音最长 30 秒；Ogg/Opus 可直接上传，其他浏览器录音会真实解码并转码为 16 kHz、16 bit、单声道 WAV。
- TTS 失败时保留 ASR 文本和模型文字回答；ASR 或文本模型失败时保留文字提问入口。
- ASR 返回静音状态 `20000003` 时统一映射为 `ASR_EMPTY`，页面提示“无法识别语音，请重新尝试”，不再误报连接失败。
- 系统提示词与公开知识库：`supabase/functions/_shared/prompt.ts`。
- 个人资料填写表：`docs/digital-twin-profile.md`，已由本人填写并同步到知识库；后续修改资料时需同步复核。

## 2. 需要配置的 Supabase Secrets

在 Supabase 项目的 **Edge Functions → Secrets** 中配置：

```dotenv
ARK_API_KEY=请在本地 .deepworks/tmp/digital-twin.env 中配置
ARK_MODEL=doubao-seed-2-1-turbo-260628
VOLC_SPEECH_API_KEY=请在本地 .deepworks/tmp/digital-twin.env 中配置
VOLC_TTS_VOICE=zh_male_qingshuangnanda_uranus_bigtts
ALLOWED_ORIGINS=https://leesir-s-personal-homepage.pages.dev,https://leesirleesirlee-star.github.io
```

说明：

1. `ARK_MODEL` 不要只填展示名称“Doubao-Seed-2.1-turbo”，应从方舟控制台复制实际 Model ID 或 Endpoint ID。
2. 方舟 API Key 与豆包语音 API Key 来自不同控制台，代码不会假设二者相同；如果你的账号实际使用同一个值，也需要分别配置两个 Secret。
3. 首选音色“清爽男大 2.0”为 `zh_male_qingshuangnanda_uranus_bigtts`。备选：`zh_male_m219_uranus_bigtts`、`zh_male_chunhou_uranus_bigtts`。仍需以账号音色库中的授权状态为准。
4. ASR 默认使用已验证可用的 `volc.seedasr.auc`（录音文件识别 2.0）；除非以后更换资源，不需要额外配置。若需覆盖，可在 Supabase Secrets 增加 `VOLC_ASR_RESOURCE_ID`。
5. 如新增正式域名，把完整 Origin 加入 `ALLOWED_ORIGINS`，不要带路径或末尾斜杠。
6. 任何密钥都不能写入 `index.html`、`assets/js/main.js`、`assets/js/digital-twin.js` 或 Git 仓库。

## 3. 部署 Edge Functions

项目已关联到 `Nick's homepage`（`hblrhrhwmnlpvpadvgmq`，首尔区域），CLI 为会话临时下载版本。部署使用服务端打包，不依赖本机 Docker：

```bash
# 密钥通过本地私密 env 文件传入，不要把真实值写进仓库或本文档
supabase secrets set --env-file .deepworks/tmp/supabase-secrets.env --remote=hblrhrhwmnlpvpadvgmq

supabase functions deploy digital-twin-chat digital-twin-voice digital-twin-tts \
  --remote=hblrhrhwmnlpvpadvgmq --use-api
```

已部署函数：

- `https://hblrhrhwmnlpvpadvgmq.functions.supabase.co/digital-twin-chat`
- `https://hblrhrhwmnlpvpadvgmq.functions.supabase.co/digital-twin-voice`
- `https://hblrhrhwmnlpvpadvgmq.functions.supabase.co/digital-twin-tts`
- 旧的 `https://hblrhrhwmnlpvpadvgmq.supabase.co/functions/v1/...` 仍作为兼容入口保留。

`supabase/config.toml` 已为三个函数启用 `verify_jwt = true`，前端会直接携带公开 anon key。公开 anon key 不是管理密钥，真正的火山密钥只保存在服务端。

Cloudflare Pages 的项目根目录新增 `functions/api/supabase/[[path]].ts`：正式站点把 `/rest/v1`、`/auth/v1` 和三个数字分身函数反代到 Supabase。反代只负责转发，不保存任何密钥；GitHub Pages 没有 Pages Functions，会自动回退到 Supabase 直连。若 Cloudflare 构建产物不是项目根目录，需要在 Pages 设置中把 Functions 目录指向仓库根部的 `functions`。

上一轮生成的 `digital-twin-realtime` 与 `pcm-capture-worklet.js` 已不再被页面或配置引用，不属于当前半双工方案，不要部署实时函数。

## 4. 联调顺序

1. 先部署 `digital-twin-chat`，用文字询问“你的研究方向是什么？”。
2. 若返回 `NOT_CONFIGURED`，检查四个必需 Secrets 是否存在。
3. 若返回 `UPSTREAM_ERROR`，在 Supabase Function Logs 中查看方舟 HTTP 状态与 requestId，不要把密钥贴到报告或聊天中。
4. 文本通过后，再部署 `digital-twin-voice`，分别验证安静环境和正常语速下的短录音；ASR 资源 ID 应为 `volc.seedasr.auc`。
5. 部署 `digital-twin-tts`，对任意文字回答点击朗读键，确认先出现“生成语音中…”，随后按钮切换为跳动波形；结束后恢复喇叭图标。
6. 语音失败时先看 Function Logs 的 `stage`：`asr`、`ark` 或 `tts`。若 ASR 返回 `45000030`，说明当前 API Key 所属项目未获该资源授权；静音或无人声应返回 `ASR_EMPTY`。
7. 临时把 `VOLC_TTS_VOICE` 改为未授权值，可验证 TTS 失败后是否仍显示文字回答；验证后立刻改回。
8. 用 HTTPS 正式地址测试麦克风权限。除 localhost 外，普通 HTTP 页面不能作为正式语音演示环境。
9. 国内网络验证时先看 Network 面板：浏览器应请求同源 `/api/supabase/...`，不应直接请求 `*.supabase.co`。若同源反代返回 HTML 或 5xx，前端会回退到函数专用域名与 Supabase 直连。

## 5. 必须人工完成的测试

- 填写并核对 `docs/digital-twin-profile.md`，否则分身只能回答当前主页公开资料，未覆盖问题应明确说不知道。
- 按 `outputs/digital-twin-test-cases.csv` 测试并记录实际回答、通过情况和失败原因。
- 语音分别测试正常语速、较小音量、轻微背景噪声、专业名词和中英混合。
- 检查录音到文字、文字到语音的总时延，以及连续三轮对话。
- 使用国内普通手机流量与宽带测试，不只使用校园网或代理网络。

## 6. 官方依据

- 方舟 Chat API：<https://www.volcengine.com/docs/82379/1298454>
- 方舟 API Key：<https://www.volcengine.com/docs/82379/1541594>
- 大模型录音文件识别极速版：<https://www.volcengine.com/docs/doubao-voice/large-model-recording-file-lite-recognition-api>
- 录音文件识别 2.0（异步 submit/query）：<https://www.volcengine.com/docs/doubao-voice/task-submission-http-1>
- 火山 TTS V3 HTTP：<https://www.volcengine.com/docs/doubao-voice/unidirectional-streaming-text-to-speech-http>
- 豆包语音 API Key：<https://www.volcengine.com/docs/doubao-voice/api-key-usage>
- 官方全双工音色兼容列表（本次用于确认音色 ID）：<https://www.volcengine.com/docs/doubao-voice/tone-list-3>
- Cloudflare Pages Functions 文件路由：<https://developers.cloudflare.com/pages/functions/routing/>
- Cloudflare Pages Functions 本地/构建：<https://developers.cloudflare.com/pages/functions/>

## 7. 当前连通状态（2026-11-08）

- 方舟文本模型已确认并部署为 `doubao-seed-2-1-turbo-260628`。
- 线上 `digital-twin-chat` 已通过真实调用：HTTP 200、CORS 正常，能够准确回答 Digital Resin、AI for Science 和升学目标。
- 火山 TTS `seed-tts-2.0` 已直接测试成功：返回 13 个音频块，拼接为约 5.23 秒、24 kHz 单声道 MP3。生产函数已兼容成功码 `20000000`。
- 新增 `digital-twin-tts` 已通过真实长文本测试：服务端自动切分约 1200 字中文文本，返回约 700 KB MP3；前端点击朗读可完成“生成语音中 → 播放波形 → 恢复图标”全流程。
- ASR 已确认可用资源为 `volc.seedasr.auc`（录音文件识别 2.0）。静音 WAV 返回 `X-Api-Status-Code: 20000003`，生产函数已映射为 `ASR_EMPTY`，页面提示“无法识别语音，请重新尝试”。
- 线上 `digital-twin-voice` 已通过真实 WAV 全链路：识别出“nick AI for Science.”，模型返回 Digital Resin 与 AI for Science 的正确回答，TTS 生成 27.264 秒、24 kHz、64 kbps 单声道 MP3。
- `digital-twin-chat`、`digital-twin-voice`、`digital-twin-tts` 三个函数均可用 `functions.supabase.co` 专用域名访问，并返回正确 CORS。
- Cloudflare Pages 同源反代已在线实测：`/api/supabase/rest/v1/project_stats` 返回真实 JSON；文本问答与 TTS 通过反代返回 200；静音 ASR 通过反代返回 422 `ASR_EMPTY`。线上页面资源记录只出现同源 `/api/supabase/...`，没有浏览器直连 `*.supabase.co`。
- GitHub Pages 镜像已验证自动回退到 Supabase 函数直连，文字回答的按需 TTS 仍可播放。
- Supabase Secrets 已配置到项目；本地私密文件已被 Git 忽略并设为仅当前用户可读写，不要复制真实值到本文档或聊天中。

> 文字、ASR、方舟回答、TTS、同源反代和 GitHub Pages 回退均已实测通过；页面麦克风权限与真实设备录音仍需在浏览器中做最终体验确认。
