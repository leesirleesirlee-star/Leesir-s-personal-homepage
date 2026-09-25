/* ============================================================
   Nick Lee — Personal Homepage  V4
   双语切换 / 双主题切换 / 入场动画 / 导航毛玻璃 / 项目详情模态
   R3 互动数据（浏览量 · 喜爱 · 留言，Supabase 直连）
   Supabase 按需加载 / Feedback 表单（V3 R2）/ Scroll Spy
   V4.1：Projects 板块「项目进程」Timeline（双语 · 阶段编号 + 状态）
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 1. i18n 词典 ---------- */
  var i18n = {
    zh: {
      "nav.about": "关于",
      "nav.projects": "项目",
      "nav.learning": "学习与兴趣",
      "nav.contact": "联系",
      "nav.feedback": "反馈",

      "hero.eyebrow": "Nick Lee",
      "hero.name": "李泽毓",
      "hero.location": "深圳 · 开放交流",
      "hero.exploring": "当前探索 · AI for Science",
      "hero.positioning": "计算机科学学生，探索 AI、数学与金融",
      "hero.identity": "天津大学 × 香港理工大学 · 深圳未来技术学院",
      "hero.tagline": "喜欢把复杂的问题拆开、把零散的线索串成体系；平时用数学和代码理解世界，也一步步朝着金融方向走去。",
      "hero.ctaPrimary": "查看我的项目",
      "hero.ctaSecondary": "联系我",
      "hero.scroll": "向下滚动",

      "about.eyebrow": "About",
      "about.title": "关于我",
      "about.body": "目前，我正专注于适应大学学习节奏，夯实计算机与数学专业基础；参与科研竞赛项目，打磨学生骨干经历；同步提升英文能力，为海外申研积累履历。",
      "about.f1.title": "逻辑严谨",
      "about.f1.desc": "做事有条理，擅长拆解复杂概念。",
      "about.f2.title": "科研与实践并行",
      "about.f2.desc": "兼顾科研实践与学生工作，多维成长。",
      "about.f3.title": "目标明确",
      "about.f3.desc": "方向清晰，执行力强。",
      "about.hint": "点击了解更多 ▾",
      "about.hintLess": "收起 ▴",
      "about.f1.more": "习惯把零散知识点整理成结构化笔记，对细节敏感，会主动梳理知识之间的关联——把\"拆解复杂\"变成可复用的方法。",
      "about.f2.more": "专业课学习、科研项目与学生工作三线并行：以课程打牢数理基础，以科研（如 Digital Resin）锻炼方法，以学生工作磨练协作与执行。",
      "about.f3.more": "以海外申研为中期目标，持续积累履历与英文能力；长期希望进入金融行业——目标清晰，路径明确。",

      "projects.eyebrow": "Projects",
      "projects.title": "项目",
      "projects.status.inprogress": "进行中",
      "projects.p1.name": "Digital Resin · 离子交换树脂数字孪生模型",
      "projects.p1.desc": "AI for Science 研究项目：构建离子交换树脂的数字孪生模型——输入树脂参数与运行条件，输出吸附性能预测的虚拟实验。",
      "projects.p2.name": "大学志愿者论坛小程序",
      "projects.p2.desc": "面向大学志愿者社群的微信小程序，支持提出建议、发布公告等功能，服务志愿活动的组织与沟通。",
      "projects.p2.tag": "微信小程序",
      "projects.status.planning": "筹备中",
      "projects.hint": "查看详情",

      "timeline.eyebrow": "Roadmap",
      "timeline.title": "项目进程",
      "timeline.lead": "从分子建模到 MVP：Digital Resin 的推进路径与下一步计划。",
      "timeline.phaseLabel": "阶段",
      "timeline.status.done": "已完成",
      "timeline.status.current": "进行中",
      "timeline.status.planned": "规划中",

      "modal.eyebrow": "项目详情",
      "modal.views": "浏览量",
      "modal.likes": "喜爱",
      "modal.sec.background": "项目背景",
      "modal.sec.goals": "项目目标（MVP 阶段）",
      "modal.sec.done": "已完成工作",
      "modal.sec.stack": "技术栈",
      "modal.sec.next": "MVP 收尾计划",
      "modal.sec.future": "未来扩展方向",
      "modal.comingSoon": "项目详情筹备中，敬请期待。",
      "comments.title": "留言",
      "comments.loading": "正在加载留言……",
      "comments.loadFail": "留言加载失败，请稍后刷新。",
      "comments.empty": "还没有留言，欢迎写下第一条。",
      "comments.namePh": "昵称（可留空，默认显示「访客」）",
      "comments.contentPh": "写下你想说的话……",
      "comments.submit": "发表留言",
      "comments.posting": "提交中……",
      "comments.success": "✓ 留言已发布，感谢！",
      "comments.error": "留言失败，请检查网络后重试。",
      "comments.emptyContent": "请先输入留言内容。",
      "comments.wait": "留言太频繁了，请稍后再试。",
      "comments.guest": "访客",

      "learning.eyebrow": "Learning & Interests",
      "learning.title": "学习与兴趣",
      "learning.i1.title": "数理基础",
      "learning.i1.desc": "数学分析、线性代数——喜欢溯源推导底层原理。",
      "learning.i2.title": "计算机技术",
      "learning.i2.desc": "开发环境配置、AI Agent、提示词工程、代码调试。",
      "learning.i3.title": "人文历史",
      "learning.i3.desc": "历史思辨、文学心理解析。",
      "learning.i4.title": "规划成长",
      "learning.i4.desc": "升学规划、履历打磨、效率工具研究。",
      "learning.i5.title": "摄影",
      "learning.i5.desc": "热爱影像记录与光影表达，后期将上传个人作品，制作线上画展。",
      "view.info": "信息",
      "view.chat": "聊天",
      "chat.greeting": "你好！我是 Nick 的数字分身。关于我的学业、科研与项目，想了解的都可以问我。",
      "chat.q1": "Nick 最近在学什么？",
      "chat.a1": "我在夯实计算机与数学的专业基础，同时探索 AI for Science——把机器学习与仿真方法用于真实科学问题（比如 Digital Resin）；课外参与学生工作，也保持着摄影这项长期爱好。",
      "chat.q2": "能介绍一下 Digital Resin 项目吗？",
      "chat.a2": "当然。Digital Resin 是我的科研项目：为离子交换树脂构建数字孪生模型，用计算机模拟吸附过程，辅助树脂筛选与工艺优化。目前已完成分子建模、结合能计算与一维扩散-吸附模拟，处于 MVP 阶段。完整进展可以在信息页的「项目」板块查看。",
      "chat.chipsLabel": "你还可以问",
      "chat.chip1": "如何联系 Nick？",
      "chat.chip2": "Nick 的长期目标是什么？",
      "chat.chip3": "Nick 有哪些兴趣爱好？",
      "chat.placeholder": "向 Nick 提问……",
      "chat.note": "静态预览 · 对话功能开发中",

      "contact.eyebrow": "Contact",
      "contact.title": "联系我",
      "contact.lead": "欢迎交流学习、科研合作或任何想法。",
      "contact.email": "邮箱",

      "feedback.eyebrow": "Feedback",
      "feedback.title": "留言反馈",
      "feedback.lead": "无论是内容、设计还是使用体验——你的每一条反馈，都会直接决定下一版的改进方向。",
      "feedback.contentLabel": "你的反馈",
      "feedback.contentPh": "对内容、结构、设计或任何想法的建议……",
      "feedback.contentHint": "至少写 6 个字，让建议更具体、更可执行",
      "feedback.contactLabel": "联系方式（可选）",
      "feedback.contactPh": "邮箱或其他，方便我回复；可不填",
      "feedback.relLabel": "你与我的关系",
      "feedback.relPlaceholder": "请选择",
      "feedback.relClassmate": "同学",
      "feedback.relTeacher": "老师",
      "feedback.relFriend": "朋友",
      "feedback.relFamily": "家人",
      "feedback.relColleague": "同事",
      "feedback.relOther": "其他",
      "feedback.relRequired": "请选择你与我的关系。",
      "feedback.deviceLabel": "你浏览所用的设备",
      "feedback.deviceMobile": "手机",
      "feedback.deviceTablet": "平板",
      "feedback.deviceDesktop": "电脑",
      "feedback.deviceOther": "其他",
      "feedback.deviceHint": "已按当前浏览器自动预选，可手动修正；设备问题修复以此为据",
      "feedback.submit": "提交反馈",
      "feedback.submitting": "提交中……",
      "feedback.success": "✓ 提交成功！感谢你的反馈，它会直接参与下一版的改进决策。",
      "feedback.error": "提交失败，请检查网络后重试。",
      "feedback.empty": "请先填写反馈内容。",

      "footer.text": "© 2026 Nick Lee · V4"
    },

    en: {
      "nav.about": "About",
      "nav.projects": "Projects",
      "nav.learning": "Learning",
      "nav.contact": "Contact",
      "nav.feedback": "Feedback",

      "hero.eyebrow": "Li Zeyu",
      "hero.name": "Nick Lee",
      "hero.location": "Shenzhen · Open to opportunities",
      "hero.exploring": "Currently exploring · AI for Science",
      "hero.positioning": "Computer Science student exploring AI, mathematics, and finance",
      "hero.identity": "Tianjin University × The Hong Kong Polytechnic University · Shenzhen Institute of Future Technology",
      "hero.tagline": "I like taking complicated problems apart and weaving scattered ideas into a system. These days I use maths and code to make sense of the world — and I'm steadily working toward finance.",
      "hero.ctaPrimary": "View My Projects",
      "hero.ctaSecondary": "Get in Touch",
      "hero.scroll": "Scroll",

      "about.eyebrow": "About",
      "about.title": "About Me",
      "about.body": "I am currently building a strong foundation in computer science and mathematics, engaging in research and competition projects, growing through student leadership roles, and strengthening my English in preparation for graduate school applications abroad.",
      "about.f1.title": "Rigorous Logic",
      "about.f1.desc": "Structured in my work, skilled at breaking down complex concepts.",
      "about.f2.title": "Research & Practice",
      "about.f2.desc": "Balancing research practice with student leadership.",
      "about.f3.title": "Clear Goals",
      "about.f3.desc": "A clear direction with strong execution.",
      "about.hint": "Click for more ▾",
      "about.hintLess": "Show less ▴",
      "about.f1.more": "I turn scattered knowledge into structured notes, stay sensitive to details, and map how concepts connect — turning \"breaking down complexity\" into a reusable method.",
      "about.f2.more": "Coursework, research, and student leadership in parallel — courses build my foundation, research (e.g., Digital Resin) sharpens method, and student work trains execution.",
      "about.f3.more": "Mid-term: building credentials and English for graduate applications abroad; long-term: a career in finance — a clear goal with a defined path.",

      "projects.eyebrow": "Projects",
      "projects.title": "Projects",
      "projects.status.inprogress": "In Progress",
      "projects.p1.name": "Digital Resin · Ion Exchange Resin Digital Twin",
      "projects.p1.desc": "An AI for Science project: a digital twin of ion exchange resin — virtual experiments that predict adsorption performance from resin parameters and operating conditions.",
      "projects.p2.name": "University Volunteer Forum",
      "projects.p2.desc": "A WeChat mini program for university volunteer communities, featuring suggestion submission and announcement publishing to support volunteer activities.",
      "projects.p2.tag": "WeChat Mini Program",
      "projects.status.planning": "Planning",
      "projects.hint": "View Details",

      "timeline.eyebrow": "Roadmap",
      "timeline.title": "Project Roadmap",
      "timeline.lead": "From molecular modeling to MVP: how Digital Resin has progressed, and what comes next.",
      "timeline.phaseLabel": "Phase",
      "timeline.status.done": "Completed",
      "timeline.status.current": "In Progress",
      "timeline.status.planned": "Planned",

      "modal.eyebrow": "Project Detail",
      "modal.views": "Views",
      "modal.likes": "Like",
      "modal.sec.background": "Background",
      "modal.sec.goals": "Goals (MVP)",
      "modal.sec.done": "Completed",
      "modal.sec.stack": "Tech Stack",
      "modal.sec.next": "MVP Wrap-up",
      "modal.sec.future": "Future Directions",
      "modal.comingSoon": "Details coming soon.",
      "comments.title": "Comments",
      "comments.loading": "Loading comments…",
      "comments.loadFail": "Failed to load comments. Please refresh later.",
      "comments.empty": "No comments yet — be the first to leave one.",
      "comments.namePh": "Nickname (optional, defaults to \u201cGuest\u201d)",
      "comments.contentPh": "Share your thoughts…",
      "comments.submit": "Post Comment",
      "comments.posting": "Posting…",
      "comments.success": "✓ Comment posted — thank you!",
      "comments.error": "Failed to post — please check your connection and try again.",
      "comments.emptyContent": "Please write something first.",
      "comments.wait": "Too frequent — please try again in a moment.",
      "comments.guest": "Guest",

      "learning.eyebrow": "Learning & Interests",
      "learning.title": "Learning & Interests",
      "learning.i1.title": "Mathematical Foundations",
      "learning.i1.desc": "Mathematical analysis and linear algebra — tracing principles back to their origins.",
      "learning.i2.title": "Computer Science",
      "learning.i2.desc": "Dev environments, AI agents, prompt engineering, and debugging.",
      "learning.i3.title": "Humanities & History",
      "learning.i3.desc": "Historical reasoning and literary-psychological analysis.",
      "learning.i4.title": "Growth Planning",
      "learning.i4.desc": "Academic planning, portfolio building, and productivity tools.",
      "learning.i5.title": "Photography",
      "learning.i5.desc": "Passionate about visual storytelling and light — personal works and an online gallery coming soon.",
      "view.info": "Info",
      "view.chat": "Chat",
      "chat.greeting": "Hi! I'm Nick's digital twin. Ask me anything about my studies, research, or projects.",
      "chat.q1": "What is Nick currently learning?",
      "chat.a1": "I'm strengthening my CS and math foundations while exploring AI for Science — applying machine learning and simulation to real scientific problems (like Digital Resin). Beyond class, I serve in student leadership and keep photography as a long-term hobby.",
      "chat.q2": "Tell me about Digital Resin.",
      "chat.a2": "Sure. Digital Resin is my research project: a digital twin for ion-exchange resins that simulates adsorption in silico, supporting resin screening and process optimization. Molecular modeling, binding-energy computation, and 1D diffusion–adsorption simulation are complete — it's at MVP stage. Full details are in the Projects section on the Info page.",
      "chat.chipsLabel": "You can also ask",
      "chat.chip1": "How can I reach Nick?",
      "chat.chip2": "What are Nick's long-term goals?",
      "chat.chip3": "What are Nick's hobbies?",
      "chat.placeholder": "Ask Nick anything…",
      "chat.note": "Static layout preview · Chat goes live in V3",

      "contact.eyebrow": "Contact",
      "contact.title": "Get in Touch",
      "contact.lead": "Feel free to reach out for academic exchange, research collaboration, or any ideas.",
      "contact.email": "Email",

      "feedback.eyebrow": "Feedback",
      "feedback.title": "Leave Feedback",
      "feedback.lead": "Content, design, usability — every piece of feedback directly shapes the next version.",
      "feedback.contentLabel": "Your feedback",
      "feedback.contentPh": "Suggestions on content, structure, design, or anything else…",
      "feedback.contentHint": "At least 6 characters — the more specific, the better",
      "feedback.contactLabel": "Contact (optional)",
      "feedback.contactPh": "Email or anything — only if you'd like a reply.",
      "feedback.relLabel": "Your relationship with me",
      "feedback.relPlaceholder": "Select…",
      "feedback.relClassmate": "Classmate",
      "feedback.relTeacher": "Teacher",
      "feedback.relFriend": "Friend",
      "feedback.relFamily": "Family",
      "feedback.relColleague": "Colleague",
      "feedback.relOther": "Other",
      "feedback.relRequired": "Please select your relationship with me.",
      "feedback.deviceLabel": "Device you're browsing on",
      "feedback.deviceMobile": "Phone",
      "feedback.deviceTablet": "Tablet",
      "feedback.deviceDesktop": "Computer",
      "feedback.deviceOther": "Other",
      "feedback.deviceHint": "Auto-detected from your browser — correct it if wrong; device-specific fixes rely on this",
      "feedback.submit": "Send Feedback",
      "feedback.submitting": "Sending…",
      "feedback.success": "✓ Thank you! Your feedback was submitted and will shape the next version.",
      "feedback.error": "Submission failed — please check your connection and try again.",
      "feedback.empty": "Please write your feedback first.",

      "footer.text": "© 2026 Nick Lee · V4"
    }
  };

  /* ---------- 1b. 项目详情数据（V2，双语） ---------- */
  var PROJECTS = {
    resin: {
      zh: {
        name: "Digital Resin · 离子交换树脂数字孪生模型",
        badge: "进行中",
        stage: "MVP 阶段",
        background: "在水处理领域，离子交换树脂被广泛用于去除水中的阳离子（如 Na⁺、Ca²⁺、Mg²⁺ 及重金属离子）。传统上，树脂的筛选、工艺参数优化和性能预测高度依赖湿实验，存在周期长、成本高、难以覆盖多变量组合等问题。AI for Science 的兴起为解决这些问题提供了新路径。本项目旨在构建一个离子交换树脂的数字孪生模型，在计算机中模拟树脂对离子的吸附过程，最终实现“输入树脂参数与运行条件，输出吸附性能预测”的虚拟实验能力。",
        goals: [
          "构建树脂官能团与目标离子的分子模型；",
          "使用机器学习势函数计算离子与树脂官能团的结合能；",
          "生成树脂颗粒的孔隙结构，并估算孔隙率与有效扩散系数；",
          "使用物理信息神经网络求解扩散-吸附方程，模拟离子在树脂颗粒内的传质与吸附过程；",
          "输出吸附动力学曲线和吸附等温线，形成最小可用的数字孪生原型。"
        ],
        done: [
          "使用 RDKit 构建了苯乙烯磺酸单体与 Na⁺ 的分子结构；",
          "使用 MACE-MP-0 对结构进行优化，计算得到 Na⁺ 与磺酸基团的结合能（-264.6 kJ/mol）；",
          "使用 Boolean 模型生成了二维孔隙结构，孔隙率为 0.343；",
          "使用 Bruggeman 关系将孔隙率映射为有效扩散系数；",
          "使用 DeepXDE 成功求解了含 Langmuir 吸附项的一维扩散-吸附方程；",
          "提取了平均吸附量随时间变化的动力学曲线，且曲线形态合理。"
        ],
        stack: [
          ["分子构建", "RDKit, ASE"],
          ["微观能量计算", "MACE-MP-0"],
          ["孔隙生成", "Boolean 随机几何模型"],
          ["介观仿真", "Physics-Informed Neural Networks (DeepXDE)"],
          ["数值与绘图", "NumPy, Matplotlib"]
        ],
        next: [
          "生成吸附等温线（理论或从 PINN 提取）；",
          "编写统一入口脚本 main.py，实现参数输入与结果输出；",
          "整理代码结构与文档，形成可交付的 MVP 版本。"
        ],
        future: [
          "支持多种离子（Ca²⁺、Mg²⁺、重金属）与温度变化；",
          "引入双尺度孔隙模型（Cox Boolean）或实验孔径分布；",
          "建立柱式吸附模型，预测突破曲线；",
          "模拟树脂再生过程；",
          "进行参数敏感性分析；",
          "开发 Streamlit 可视化界面；",
          "引入实验数据训练与主动学习，逐步实现 AI Agent 自主学习闭环。"
        ],
        github: "https://github.com/leesirleesirlee-star/Digital-Resin"
      },
      en: {
        name: "Digital Resin · Ion Exchange Resin Digital Twin",
        badge: "In Progress",
        stage: "MVP Stage",
        background: "In water treatment, ion exchange resins are widely used to remove cations (Na⁺, Ca²⁺, Mg²⁺, heavy metals). Resin screening, process optimization and performance prediction have traditionally relied on wet experiments — slow, costly, and hard to scale across variable combinations. AI for Science opens a new path: a digital twin that simulates adsorption in silico — resin parameters and operating conditions in, adsorption performance prediction out.",
        goals: [
          "Build molecular models of resin functional groups and target ions;",
          "Compute ion–functional-group binding energies with a machine-learned potential;",
          "Generate pore structures and estimate porosity and effective diffusivity;",
          "Solve the diffusion–adsorption equation with physics-informed neural networks;",
          "Output adsorption kinetics and isotherms — a minimum viable digital twin."
        ],
        done: [
          "Built styrene-sulfonate monomer and Na⁺ structures with RDKit;",
          "Optimized with MACE-MP-0 and obtained the Na⁺–sulfonate binding energy (−264.6 kJ/mol);",
          "Generated a 2D pore structure with a Boolean model (porosity 0.343);",
          "Mapped porosity to effective diffusivity via the Bruggeman relation;",
          "Solved the 1D diffusion–adsorption equation with a Langmuir term using DeepXDE;",
          "Extracted a kinetics curve of average adsorption over time with a reasonable shape."
        ],
        stack: [
          ["Molecular building", "RDKit, ASE"],
          ["Micro-scale energetics", "MACE-MP-0"],
          ["Pore generation", "Boolean stochastic geometry"],
          ["Meso-scale simulation", "PINNs (DeepXDE)"],
          ["Numerics & plotting", "NumPy, Matplotlib"]
        ],
        next: [
          "Generate adsorption isotherms (theoretical or from the PINN);",
          "Write a unified entry script main.py for parameter input and result output;",
          "Organize code structure and documentation into a deliverable MVP."
        ],
        future: [
          "Support more ions (Ca²⁺, Mg²⁺, heavy metals) and temperature variation;",
          "Introduce a dual-scale pore model (Cox Boolean) or experimental pore-size distributions;",
          "Build a column adsorption model to predict breakthrough curves;",
          "Simulate resin regeneration;",
          "Parameter sensitivity analysis;",
          "Streamlit visualization interface;",
          "Experimental-data training and active learning toward an autonomous AI-Agent closed loop."
        ],
        github: "https://github.com/leesirleesirlee-star/Digital-Resin"
      }
    },
    forum: {
      zh: {
        name: "大学志愿者论坛小程序",
        badge: "筹备中",
        stage: "",
        desc: "面向大学志愿者社群的微信小程序，支持提出建议、发布公告等功能，服务志愿活动的组织与沟通。",
        note: "项目详情筹备中，敬请期待。"
      },
      en: {
        name: "University Volunteer Forum",
        badge: "Planning",
        stage: "",
        desc: "A WeChat mini program for university volunteer communities, featuring suggestion submission and announcement publishing to support volunteer activities.",
        note: "Details coming soon."
      }
    }
  };

  /* ---------- 1b-2. 项目进程 Timeline 数据（V4.1，双语） ----------
     总览级粒度：已完成 3 阶段 / 进行中 1 阶段 / 规划中 1 阶段；
     详细清单仍在项目详情模态中展示，两者互补不重复 */
  var TIMELINE = [
    {
      status: "done",
      zh: {
        title: "分子建模与能量计算",
        desc: "使用 RDKit 构建苯乙烯磺酸单体与 Na⁺ 的分子结构；经 MACE-MP-0 优化，算得结合能 -264.6 kJ/mol。"
      },
      en: {
        title: "Molecular Modeling & Energetics",
        desc: "Built styrene-sulfonate monomer and Na⁺ structures with RDKit; optimized with MACE-MP-0 to obtain a binding energy of −264.6 kJ/mol."
      }
    },
    {
      status: "done",
      zh: {
        title: "孔隙结构与扩散映射",
        desc: "以 Boolean 随机几何模型生成二维孔隙结构（孔隙率 0.343），并经 Bruggeman 关系映射为有效扩散系数。"
      },
      en: {
        title: "Pore Structure & Diffusivity Mapping",
        desc: "Generated a 2D pore structure with a Boolean stochastic model (porosity 0.343), mapped to effective diffusivity via the Bruggeman relation."
      }
    },
    {
      status: "done",
      zh: {
        title: "扩散-吸附数值模拟",
        desc: "使用 DeepXDE 求解含 Langmuir 吸附项的一维扩散-吸附方程，提取平均吸附量随时间变化的动力学曲线。"
      },
      en: {
        title: "Diffusion–Adsorption Simulation",
        desc: "Solved the 1D diffusion–adsorption equation with a Langmuir term using DeepXDE, and extracted the adsorption-kinetics curve over time."
      }
    },
    {
      status: "current",
      zh: {
        title: "MVP 收尾",
        desc: "生成吸附等温线、编写统一入口脚本 main.py、整理代码与文档，形成可交付的 MVP 版本。"
      },
      en: {
        title: "MVP Wrap-up",
        desc: "Generating adsorption isotherms, writing the unified main.py entry script, and organizing code and docs into a deliverable MVP."
      }
    },
    {
      status: "planned",
      zh: {
        title: "后续扩展",
        desc: "多离子与温度支持、双尺度孔隙模型、柱式吸附突破曲线、Streamlit 可视化与主动学习闭环。"
      },
      en: {
        title: "Future Extensions",
        desc: "Multi-ion and temperature support, dual-scale pore models, column breakthrough curves, Streamlit visualization, and an active-learning loop."
      }
    }
  ];

  /* ---------- 1c. Supabase 客户端（V4：按需加载） ----------
     anon key 为 Supabase 可公开密钥，安全由 RLS 策略保证；service key 永不入库。
     首屏不加载 supabase-js（218KB）：打开项目详情 / 提交反馈时动态引入，加载一次并复用 */
  var SUPABASE_URL = "https://hblrhrhwmnlpvpadvgmq.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhibHJocmh3bW5scHZwYWR2Z21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2Mjc4NTUsImV4cCI6MjEwNTIwMzg1NX0.tBGCHkTJN_EoiycwZf36ARirJSKK8xvJXYSlQISe1tM";
  var supabaseClient = null;
  var supabaseLoading = null;

  function loadSupabase() {
    if (supabaseClient) return Promise.resolve(supabaseClient);
    if (supabaseLoading) return supabaseLoading;
    supabaseLoading = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = "assets/vendor/supabase-js.js";
      s.onload = function () {
        if (window.supabase && typeof window.supabase.createClient === "function") {
          supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
          resolve(supabaseClient);
        } else {
          supabaseLoading = null;
          reject(new Error("supabase-js unavailable"));
        }
      };
      s.onerror = function () {
        supabaseLoading = null;
        reject(new Error("supabase-js load failed"));
      };
      document.head.appendChild(s);
    });
    return supabaseLoading;
  }

  /* ---------- 1d. 通用工具（V4） ---------- */
  function dict() {
    return i18n[htmlEl.getAttribute("lang") === "en" ? "en" : "zh"] || i18n.zh;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function safeGet(store, key) {
    try { return store.getItem(key); } catch (e) { return null; }
  }

  function safeSet(store, key, value) {
    try { store.setItem(key, value); } catch (e) {}
  }

  /* ---------- 2. 语言切换 ---------- */
  var htmlEl = document.documentElement;
  var langToggle = document.getElementById("lang-toggle");
  var themeToggle = document.getElementById("theme-toggle");

  function detectLang() {
    var saved = null;
    try { saved = localStorage.getItem("nick-homepage-lang"); } catch (e) {}
    if (saved === "zh" || saved === "en") return saved;
    var nav = (navigator.language || "en").toLowerCase();
    return nav.indexOf("zh") === 0 ? "zh" : "en";
  }

  function applyLang(lang) {
    var dict = i18n[lang] || i18n.zh;
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute("data-i18n");
      if (dict[key]) nodes[i].textContent = dict[key];
    }
    /* placeholder 类属性走 data-i18n-ph（textContent 之外的文案） */
    var phNodes = document.querySelectorAll("[data-i18n-ph]");
    for (var p = 0; p < phNodes.length; p++) {
      var phKey = phNodes[p].getAttribute("data-i18n-ph");
      if (dict[phKey]) phNodes[p].setAttribute("placeholder", dict[phKey]);
    }
    htmlEl.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");
    document.title = lang === "zh"
      ? "Nick Lee 李泽毓 · Personal Homepage"
      : "Nick Lee · Personal Homepage";
    langToggle.textContent = lang === "zh" ? "EN" : "中";
    try { localStorage.setItem("nick-homepage-lang", lang); } catch (e) {}
    // 模态打开时切换语言：重渲染详情并重新加载互动数据
    if (openProjectId) {
      renderProjectModal(openProjectId);
      initProjectInteraction(openProjectId);
    }
    // 已展开的 About 卡片，重设 hint 文案
    var expandedCards = document.querySelectorAll(".feature-card.expanded");
    for (var ec = 0; ec < expandedCards.length; ec++) {
      var hint = expandedCards[ec].querySelector(".feature-hint");
      if (hint) hint.textContent = dict["about.hintLess"];
    }
    // 项目进程 Timeline：按当前语言重渲染（首屏初始化与切换语言共用）
    renderTimeline();
  }

  langToggle.addEventListener("click", function () {
    var current = htmlEl.getAttribute("lang") === "en" ? "en" : "zh";
    applyLang(current === "zh" ? "en" : "zh");
  });

  /* ---------- 2b. 项目进程 Timeline 渲染（V4.1） ---------- */
  function renderTimeline() {
    var listEl = document.getElementById("timeline");
    if (!listEl) return;
    var d = dict();
    var lang = htmlEl.getAttribute("lang") === "en" ? "en" : "zh";
    var html = "";
    for (var i = 0; i < TIMELINE.length; i++) {
      var item = TIMELINE[i];
      var copy = item[lang] || item.zh;
      html += '<li class="timeline-item timeline-item--' + item.status + ' reveal">'
        + '<div class="timeline-phase">'
        + '<span class="timeline-phase-label">' + d["timeline.phaseLabel"] + '</span>'
        + '<span class="timeline-phase-num">' + pad2(i + 1) + '</span>'
        + '</div>'
        + '<span class="timeline-dot" aria-hidden="true"></span>'
        + '<div class="timeline-content">'
        + '<div class="timeline-item-head">'
        + '<h4>' + escapeHtml(copy.title) + '</h4>'
        + '<span class="tl-status tl-status--' + item.status + '">' + d["timeline.status." + item.status] + '</span>'
        + '</div>'
        + '<p>' + escapeHtml(copy.desc) + '</p>'
        + '</div>'
        + '</li>';
    }
    listEl.innerHTML = html;
    observeRevealNodes(listEl.querySelectorAll(".reveal"));
  }

  /* ---------- 3. 主题切换 ---------- */
  function detectTheme() {
    var saved = null;
    try { saved = localStorage.getItem("nick-homepage-theme"); } catch (e) {}
    if (saved === "light" || saved === "dark") return saved;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function applyTheme(theme) {
    htmlEl.setAttribute("data-theme", theme);
    try { localStorage.setItem("nick-homepage-theme", theme); } catch (e) {}
  }

  themeToggle.addEventListener("click", function () {
    var current = htmlEl.getAttribute("data-theme") === "dark" ? "dark" : "light";
    applyTheme(current === "dark" ? "light" : "dark");
  });

  /* ---------- 4. 入场动画（IntersectionObserver，滚入重播） ---------- */
  var revealObserver = null;
  var revealInitDone = false;

  /* 动态渲染的 .reveal 节点（如 Timeline 项）在此登记：
     初始化阶段留给 initReveal 统一观察；IO 不可用时直接显现 */
  function observeRevealNodes(nodes) {
    if (!nodes || !nodes.length) return;
    if (revealObserver) {
      for (var i = 0; i < nodes.length; i++) revealObserver.observe(nodes[i]);
      return;
    }
    if (!revealInitDone) return;
    for (var j = 0; j < nodes.length; j++) nodes[j].classList.add("visible");
  }

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    revealInitDone = true;
    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add("visible");
      return;
    }
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        /* 滚入视口→显现；离开→回到初始态，下次滚入再次重播 */
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } else {
          entry.target.classList.remove("visible");
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    for (var j = 0; j < items.length; j++) revealObserver.observe(items[j]);
  }

  /* ---------- 5. 导航毛玻璃 ---------- */
  function initNavbar() {
    var navbar = document.getElementById("navbar");
    function onScroll() {
      if (window.scrollY > 24) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // 移动端菜单
    var menuBtn = document.getElementById("menu-btn");
    var mobileMenu = document.getElementById("mobile-menu");
    if (menuBtn && mobileMenu) {
      function toggleMenu(open) {
        var isOpen = typeof open === "boolean" ? open : !mobileMenu.classList.contains("open");
        mobileMenu.classList.toggle("open", isOpen);
        menuBtn.classList.toggle("open", isOpen);
        menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        mobileMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
        document.body.style.overflow = isOpen ? "hidden" : "";
      }
      menuBtn.addEventListener("click", function () { toggleMenu(); });
      var mobileLinks = mobileMenu.querySelectorAll("a");
      for (var m = 0; m < mobileLinks.length; m++) {
        mobileLinks[m].addEventListener("click", function () {
          /* chat 视图下点锚点：先回到信息页再跳转 */
          if (document.body.getAttribute("data-view") === "chat") setView("info");
          toggleMenu(false);
        });
      }
    }

    // Scroll spy：高亮当前 section 对应的导航链接
    var links = document.querySelectorAll(".nav-links a");
    var sections = [
      { id: "about", el: document.getElementById("about") },
      { id: "projects", el: document.getElementById("projects") },
      { id: "learning", el: document.getElementById("learning") },
      { id: "contact", el: document.getElementById("contact") },
      { id: "feedback", el: document.getElementById("feedback") }
    ];
    function clearActive() {
      for (var a = 0; a < links.length; a++) {
        links[a].classList.remove("active");
        links[a].removeAttribute("aria-current");
      }
    }
    function setActive(id) {
      clearActive();
      for (var a = 0; a < links.length; a++) {
        if (links[a].getAttribute("href") === "#" + id) {
          links[a].classList.add("active");
          links[a].setAttribute("aria-current", "true");
        }
      }
    }
    var hero = document.getElementById("hero");
    if (hero) {
      var heroObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) clearActive();
      }, { rootMargin: "-45% 0px -50% 0px" });
      heroObs.observe(hero);
    }
    if ("IntersectionObserver" in window) {
      var spyObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
      for (var s = 0; s < sections.length; s++) {
        if (sections[s].el) spyObs.observe(sections[s].el);
      }
    } else {
      // 降级：滚动时按位置判断
      var altLinks = links;
      function onSpyScroll() {
        var pos = window.scrollY + 120;
        var current = "";
        for (var s2 = 0; s2 < sections.length; s2++) {
          var el = sections[s2].el;
          if (el && el.offsetTop <= pos) current = sections[s2].id;
        }
        if (window.scrollY < 200) clearActive();
        else setActive(current);
      }
      window.addEventListener("scroll", onSpyScroll, { passive: true });
      onSpyScroll();
    }
  }

  /* ---------- 5b. 项目详情模态（V2） ---------- */
  var modal = document.getElementById("project-modal");
  var modalBody = document.getElementById("modal-body");
  var modalClose = document.getElementById("modal-close");
  var openProjectId = null;

  function modalSectionTitle(key) {
    return i18n[htmlEl.getAttribute("lang") === "en" ? "en" : "zh"][key] || "";
  }

  function renderProjectModal(id) {
    var lang = htmlEl.getAttribute("lang") === "en" ? "en" : "zh";
    var t = modalSectionTitle;
    var p = PROJECTS[id] && PROJECTS[id][lang];
    if (!p) { modalBody.innerHTML = ""; return; }

    var gh = p.github
      ? '<a class="modal-github" href="' + p.github + '" target="_blank" rel="noopener noreferrer">GitHub ↗</a>'
      : "";

    var html = '';
    html += '<p class="modal-eyebrow">' + (lang === "zh" ? "项目详情" : "Project Detail") + '</p>';
    html += '<h2 class="modal-title" id="modal-title">' + p.name + '</h2>';
    html += '<div class="modal-meta">';
    html += '<span class="badge">' + p.badge + '</span>';
    if (p.stage) html += '<span class="stage-chip">' + p.stage + '</span>';
    html += gh;
    html += '</div>';

    /* R3 互动数据（V4）：浏览量（打开即计数）+ 喜爱按钮（本地去重，单向） */
    html += '<div class="modal-stats">';
    html += '<span class="stat">' + t("modal.views") + ' <b id="stat-views-num">—</b></span>';
    html += '<button class="stat stat-like" id="stat-like" type="button" aria-pressed="false">' + t("modal.likes") + ' <b id="stat-likes-num">—</b></button>';
    html += '</div>';

    if (p.background) {
      html += '<section class="m-sec"><h3>' + t("modal.sec.background") + '</h3><p>' + p.background + '</p></section>';
    }
    if (p.goals && p.goals.length) {
      html += '<section class="m-sec"><h3>' + t("modal.sec.goals") + '</h3><ol>' +
        p.goals.map(function (g) { return "<li>" + g + "</li>"; }).join("") + '</ol></section>';
    }
    if (p.done && p.done.length) {
      html += '<section class="m-sec"><h3>' + t("modal.sec.done") + '</h3><ul>' +
        p.done.map(function (d) { return "<li>" + d + "</li>"; }).join("") + '</ul></section>';
    }
    if (p.stack && p.stack.length) {
      html += '<section class="m-sec"><h3>' + t("modal.sec.stack") + '</h3><div class="stack">' +
        p.stack.map(function (row) {
          return '<div class="stack-row"><span class="stack-mod">' + row[0] + '</span><span class="stack-tool">' + row[1] + '</span></div>';
        }).join("") + '</div></section>';
    }
    if (p.next && p.next.length) {
      html += '<section class="m-sec"><h3>' + t("modal.sec.next") + '</h3><ul>' +
        p.next.map(function (n) { return "<li>" + n + "</li>"; }).join("") + '</ul></section>';
    }
    if (p.future && p.future.length) {
      html += '<section class="m-sec"><h3>' + t("modal.sec.future") + '</h3><ul>' +
        p.future.map(function (f) { return "<li>" + f + "</li>"; }).join("") + '</ul></section>';
    }
    if (p.note) {
      html += '<section class="m-sec"><p class="modal-note">' + p.note + '</p></section>';
    }

    /* R3 留言（V4）：列表 + 发表表单（honeypot + 30s 限频） */
    html += '<section class="m-sec"><h3>' + t("comments.title") + '</h3>';
    html += '<div class="comments-list" id="comments-list"><p class="comments-loading">' + t("comments.loading") + '</p></div>';
    html += '<form class="comment-form" id="comment-form" novalidate>';
    html += '<input class="comment-input" id="comment-name" type="text" maxlength="30" autocomplete="nickname" placeholder="' + t("comments.namePh") + '" aria-label="' + t("comments.namePh") + '">';
    html += '<textarea class="comment-textarea" id="comment-content" maxlength="500" rows="3" placeholder="' + t("comments.contentPh") + '" aria-label="' + t("comments.contentPh") + '"></textarea>';
    html += '<input type="text" id="comment-hp" class="fb-hp" tabindex="-1" autocomplete="off" aria-hidden="true">';
    html += '<div class="comment-form-foot">';
    html += '<button class="comment-submit" id="comment-submit" type="submit">' + t("comments.submit") + '</button>';
    html += '<p class="comment-status" id="comment-status" role="status" aria-live="polite"></p>';
    html += '</div>';
    html += '</form></section>';

    modalBody.innerHTML = html;
  }

  function openProjectModal(id) {
    if (!id) return;
    openProjectId = id;
    renderProjectModal(id);
    initProjectInteraction(id);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modalClose.focus();
  }

  function closeProjectModal() {
    openProjectId = null;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function initModal() {
    var cards = document.querySelectorAll(".project-card[data-project]");
    for (var i = 0; i < cards.length; i++) {
      cards[i].addEventListener("click", function (e) {
        if (e.target.closest("a")) return; // 放行独立链接（GitHub）
        openProjectModal(this.getAttribute("data-project"));
      });
      cards[i].addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openProjectModal(this.getAttribute("data-project"));
        }
      });
    }
    modalClose.addEventListener("click", closeProjectModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeProjectModal();
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && openProjectId) closeProjectModal();
    });
  }

  /* ---------- 5b-2. R3 互动数据（V4）：浏览量 / 喜爱 / 留言 ---------- */
  var VIEW_KEY = "viewed:";
  var LIKE_KEY = "liked:";
  var LAST_COMMENT_KEY = "lastCommentAt";
  var COMMENT_COOLDOWN = 30000; /* 30s 简易限频 */

  function hasViewed(id) { return safeGet(sessionStorage, VIEW_KEY + id) === "1"; }
  function markViewed(id) { safeSet(sessionStorage, VIEW_KEY + id, "1"); }
  function isLiked(id) { return safeGet(localStorage, LIKE_KEY + id) === "1"; }
  function markLiked(id) { safeSet(localStorage, LIKE_KEY + id, "1"); }

  function setCommentStatus(type, text) {
    var el = document.getElementById("comment-status");
    if (!el) return;
    el.className = "comment-status" + (type ? " " + type : "");
    el.textContent = text || "";
  }

  function loadComments(sb, id) {
    var listEl = document.getElementById("comments-list");
    if (!listEl) return;
    function fail() {
      listEl.innerHTML = '<p class="comments-empty">' + escapeHtml(dict()["comments.loadFail"]) + '</p>';
    }
    sb.from("comments")
      .select("nickname, content, created_at")
      .eq("project_id", id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(function (res) {
        var d = dict();
        if (res.error) { fail(); return; }
        var rows = res.data || [];
        if (!rows.length) {
          listEl.innerHTML = '<p class="comments-empty">' + escapeHtml(d["comments.empty"]) + '</p>';
          return;
        }
        var html = "";
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          html += '<div class="comment-item">';
          html += '<div class="comment-head">';
          html += '<span class="comment-name">' + escapeHtml(r.nickname || d["comments.guest"]) + '</span>';
          html += '<span class="comment-date">' + escapeHtml(fmtDate(r.created_at)) + '</span>';
          html += '</div>';
          html += '<p class="comment-text">' + escapeHtml(r.content) + '</p>';
          html += '</div>';
        }
        listEl.innerHTML = html;
      }, fail);
  }

  function initProjectInteraction(id) {
    var viewsNum = document.getElementById("stat-views-num");
    var likesNum = document.getElementById("stat-likes-num");
    var likeBtn = document.getElementById("stat-like");

    /* 喜爱：本地单向去重（已赞不可取消） */
    if (likeBtn) {
      if (isLiked(id)) {
        likeBtn.classList.add("liked");
        likeBtn.setAttribute("aria-pressed", "true");
      }
      likeBtn.addEventListener("click", function () {
        if (isLiked(id)) return;
        likeBtn.disabled = true;
        loadSupabase().then(function (sb) {
          return sb.rpc("increment_likes", { p_project_id: id });
        }).then(function (res) {
          likeBtn.disabled = false;
          if (!res || res.error) return;
          if (typeof res.data === "number" && likesNum) likesNum.textContent = res.data;
          markLiked(id);
          likeBtn.classList.add("liked");
          likeBtn.setAttribute("aria-pressed", "true");
        }, function () {
          likeBtn.disabled = false;
        });
      });
    }

    /* 统计 + 留言：按需加载 supabase-js 后拉取 */
    loadSupabase().then(function (sb) {
      sb.from("project_stats").select("views, likes").eq("project_id", id).single().then(function (res) {
        if (!res.error && res.data) {
          if (likesNum) likesNum.textContent = res.data.likes;
          if (hasViewed(id) && viewsNum) viewsNum.textContent = res.data.views;
        }
        /* 本会话首次打开：RPC 计数；先本地标记，避免并发重复 +1 */
        if (!hasViewed(id)) {
          markViewed(id);
          sb.rpc("increment_views", { p_project_id: id }).then(function (r2) {
            if (!r2.error && typeof r2.data === "number" && viewsNum) viewsNum.textContent = r2.data;
          });
        }
      });
      loadComments(sb, id);
    }, function () {
      var listEl = document.getElementById("comments-list");
      if (listEl) listEl.innerHTML = '<p class="comments-empty">' + escapeHtml(dict()["comments.loadFail"]) + '</p>';
    });

    /* 留言提交 */
    var formEl = document.getElementById("comment-form");
    if (!formEl) return;
    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = dict();
      var hpEl = document.getElementById("comment-hp");
      if (hpEl && hpEl.value) { formEl.reset(); return; } /* honeypot：机器人静默丢弃 */
      var nameEl = document.getElementById("comment-name");
      var contentEl = document.getElementById("comment-content");
      var submitBtn = document.getElementById("comment-submit");
      var content = contentEl.value.trim();
      if (!content) { setCommentStatus("error", d["comments.emptyContent"]); contentEl.focus(); return; }
      var last = parseInt(safeGet(localStorage, LAST_COMMENT_KEY) || "0", 10) || 0;
      if (Date.now() - last < COMMENT_COOLDOWN) { setCommentStatus("error", d["comments.wait"]); return; }

      submitBtn.disabled = true;
      var originalText = submitBtn.textContent;
      submitBtn.textContent = d["comments.posting"];

      loadSupabase().then(function (sb) {
        var payload = { project_id: id, content: content.slice(0, 500) };
        var name = (nameEl.value || "").trim().slice(0, 30);
        if (name) payload.nickname = name; /* 留空则用数据库默认「访客」 */
        return sb.from("comments").insert(payload).then(function (res) {
          return { res: res, sb: sb };
        });
      }).then(function (out) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        if (!out.res || out.res.error) { setCommentStatus("error", d["comments.error"]); return; }
        safeSet(localStorage, LAST_COMMENT_KEY, String(Date.now()));
        setCommentStatus("success", d["comments.success"]);
        formEl.reset();
        loadComments(out.sb, id);
      }, function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        setCommentStatus("error", d["comments.error"]);
      });
    });
  }

  /* ---------- 5c. About 卡片展开（V2） ---------- */
  function initExpand() {
    var cards = document.querySelectorAll(".feature-card[data-expand]");
    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        var hint = card.querySelector(".feature-hint");
        function toggle() {
          var dict = i18n[htmlEl.getAttribute("lang") === "en" ? "en" : "zh"];
          var expanded = card.classList.toggle("expanded");
          if (hint) hint.textContent = expanded ? dict["about.hintLess"] : dict["about.hint"];
        }
        card.addEventListener("click", toggle);
        card.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        });
      })(cards[i]);
    }
  }

  /* ---------- 5d. 视图切换（Info / Chat，仿 ChatGPT 顶部切换） ---------- */
  function setView(view) {
    if (view !== "info" && view !== "chat") return;
    document.body.setAttribute("data-view", view);

    var btns = document.querySelectorAll(".view-switch-btn");
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute("data-view-target") === view;
      btns[i].classList.toggle("active", on);
      btns[i].setAttribute("aria-selected", on ? "true" : "false");
    }

    /* 切视图前关掉打开中的模态与移动端菜单，避免浮层残留 */
    if (openProjectId) closeProjectModal();

    var mobileMenu = document.getElementById("mobile-menu");
    var menuBtn = document.getElementById("menu-btn");
    if (mobileMenu && mobileMenu.classList.contains("open")) {
      mobileMenu.classList.remove("open");
      mobileMenu.setAttribute("aria-hidden", "true");
      if (menuBtn) {
        menuBtn.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
      document.body.style.overflow = "";
    }

    /* 立即回顶（绕过 CSS smooth，避免切视图后停在原滚动位置） */
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = "";
  }

  function initViewSwitch() {
    var btns = document.querySelectorAll(".view-switch-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function () {
        setView(this.getAttribute("data-view-target"));
      });
    }

    /* chat 视图下点 logo：先回到信息页 */
    var logo = document.querySelector(".nav-logo");
    if (logo) {
      logo.addEventListener("click", function () {
        if (document.body.getAttribute("data-view") === "chat") setView("info");
      });
    }
  }

  /* ---------- 5e. 返回顶部按钮 ---------- */
  function initBackToTop() {
    var btn = document.getElementById("back-to-top");
    if (!btn) return;
    function onScroll() {
      var show = window.scrollY > 400;
      btn.classList.toggle("show", show);
      btn.setAttribute("aria-hidden", show ? "false" : "true");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- 5f. Chat 静态预览：建议追问 chips 点击填充输入框 ---------- */
  function initChat() {
    var input = document.getElementById("chat-input");
    if (!input) return;
    var chips = document.querySelectorAll(".chat-chip");
    for (var i = 0; i < chips.length; i++) {
      chips[i].addEventListener("click", function () {
        /* textContent 已被 applyLang 本地化为当前语言 */
        input.value = this.textContent;
        input.focus();
      });
    }
  }

  /* ---------- 5g. Feedback 表单（V3 R2：Supabase 直连，免登录） ---------- */
  function initFeedback() {
    var form = document.getElementById("feedback-form");
    if (!form) return;
    var contentEl = document.getElementById("fb-content");
    var contactEl = document.getElementById("fb-contact");
    var relEl = document.getElementById("fb-relationship");
    var deviceEl = document.getElementById("fb-device");
    var hpEl = document.getElementById("fb-company");
    var submitBtn = document.getElementById("fb-submit");
    var submitLabel = submitBtn.querySelector("span");
    var statusEl = document.getElementById("fb-status");
    var fadeTimer = null;

    /* R2.5：按 UA 自动预选设备大类（用户可改）；提交时另采集完整技术细节 */
    function detectDeviceType() {
      var ua = navigator.userAgent;
      if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablet";
      if (/Mobile|iPhone|iPod|Windows Phone/i.test(ua)) return "mobile";
      return "desktop";
    }
    function collectDeviceInfo() {
      return [
        navigator.userAgent,
        "screen:" + (window.screen ? window.screen.width + "x" + window.screen.height : "?"),
        "viewport:" + window.innerWidth + "x" + window.innerHeight,
        "touch:" + (("ontouchstart" in window) ? "yes" : "no"),
        "osLang:" + navigator.language
      ].join(" | ").slice(0, 500);
    }
    deviceEl.value = detectDeviceType();

    function setStatus(type, text) {
      if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null; }
      statusEl.className = "fb-status" + (type ? " " + type : "");
      statusEl.style.opacity = "1";
      statusEl.textContent = text || "";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      /* honeypot：机器人填写则静默丢弃（不暴露拦截行为） */
      if (hpEl.value) { form.reset(); deviceEl.value = detectDeviceType(); return; }
      var d = dict();
      if (!relEl.value) { setStatus("error", d["feedback.relRequired"]); relEl.focus(); return; }
      var content = contentEl.value.trim();
      if (!content) { setStatus("error", d["feedback.empty"]); return; }

      submitBtn.disabled = true;
      submitLabel.textContent = d["feedback.submitting"];
      setStatus("pending", d["feedback.submitting"]);

      function restore() {
        submitBtn.disabled = false;
        submitLabel.textContent = d["feedback.submit"];
      }
      /* V4：supabase-js 按需加载后再提交（首屏省 218KB） */
      loadSupabase().then(function (sb) {
        return sb.from("feedback").insert({
          content: content,
          contact: contactEl.value.trim() || null,
          relationship: relEl.value,
          device_type: deviceEl.value || detectDeviceType(),
          device_info: collectDeviceInfo(),
          lang: htmlEl.getAttribute("lang") === "en" ? "en" : "zh",
          page: "home"
        });
      }).then(function (res) {
        restore();
        if (!res || res.error) { setStatus("error", d["feedback.error"]); return; }
        setStatus("success", d["feedback.success"]);
        form.reset();
        deviceEl.value = detectDeviceType();
        fadeTimer = setTimeout(function () {
          statusEl.style.opacity = "0";
        }, 5000);
      }, function () {
        restore();
        setStatus("error", d["feedback.error"]);
      });
    });
  }

  /* ---------- 6. 初始化 ---------- */
  applyTheme(detectTheme());
  applyLang(detectLang());
  initReveal();
  initNavbar();
  initModal();
  initExpand();
  initViewSwitch();
  initBackToTop();
  initChat();
  initFeedback();
})();
