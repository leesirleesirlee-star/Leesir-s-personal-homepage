/* ============================================================
   Nick Lee — Personal Homepage  V1.0
   双语切换 / 双主题切换 / 入场动画 / 导航毛玻璃
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

      "hero.eyebrow": "Nick Lee",
      "hero.name": "李泽毓",
      "hero.identity": "天津大学香港理工大学深圳未来技术学院 · 计算机方向",
      "hero.tagline": "深耕数理基础，热衷梳理知识体系。为海外申研积累，未来希望从事金融行业。",
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

      "modal.eyebrow": "项目详情",
      "modal.views": "浏览量",
      "modal.likes": "喜爱量",
      "modal.statsNote": "互动数据将在 V3 上线后激活",
      "modal.sec.background": "项目背景",
      "modal.sec.goals": "项目目标（MVP 阶段）",
      "modal.sec.done": "已完成工作",
      "modal.sec.stack": "技术栈",
      "modal.sec.next": "MVP 收尾计划",
      "modal.sec.future": "未来扩展方向",
      "modal.comingSoon": "项目详情筹备中，敬请期待。",

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

      "contact.eyebrow": "Contact",
      "contact.title": "联系我",
      "contact.lead": "欢迎交流学习、科研合作或任何想法。",
      "contact.email": "邮箱",

      "footer.text": "© 2026 Nick Lee · V1.0"
    },

    en: {
      "nav.about": "About",
      "nav.projects": "Projects",
      "nav.learning": "Learning",
      "nav.contact": "Contact",

      "hero.eyebrow": "Li Zeyu",
      "hero.name": "Nick Lee",
      "hero.identity": "Computer Science · Shenzhen Institute of Future Technology, Tianjin University & The Hong Kong Polytechnic University",
      "hero.tagline": "Building deep foundations in mathematics and computing, with a passion for structuring knowledge — preparing for graduate study abroad, toward a future in finance.",
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

      "modal.eyebrow": "Project Detail",
      "modal.views": "Views",
      "modal.likes": "Likes",
      "modal.statsNote": "Interactive stats go live in V3",
      "modal.sec.background": "Background",
      "modal.sec.goals": "Goals (MVP)",
      "modal.sec.done": "Completed",
      "modal.sec.stack": "Tech Stack",
      "modal.sec.next": "MVP Wrap-up",
      "modal.sec.future": "Future Directions",
      "modal.comingSoon": "Details coming soon.",

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

      "contact.eyebrow": "Contact",
      "contact.title": "Get in Touch",
      "contact.lead": "Feel free to reach out for academic exchange, research collaboration, or any ideas.",
      "contact.email": "Email",

      "footer.text": "© 2026 Nick Lee · V1.0"
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
    htmlEl.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");
    document.title = lang === "zh"
      ? "Nick Lee 李泽毓 · Personal Homepage"
      : "Nick Lee · Personal Homepage";
    langToggle.textContent = lang === "zh" ? "EN" : "中";
    try { localStorage.setItem("nick-homepage-lang", lang); } catch (e) {}
    // 模态打开时切换语言，重渲染详情内容
    if (openProjectId) renderProjectModal(openProjectId);
    // 已展开的 About 卡片，重设 hint 文案
    var expandedCards = document.querySelectorAll(".feature-card.expanded");
    for (var ec = 0; ec < expandedCards.length; ec++) {
      var hint = expandedCards[ec].querySelector(".feature-hint");
      if (hint) hint.textContent = dict["about.hintLess"];
    }
  }

  langToggle.addEventListener("click", function () {
    var current = htmlEl.getAttribute("lang") === "en" ? "en" : "zh";
    applyLang(current === "zh" ? "en" : "zh");
  });

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

  /* ---------- 4. 入场动画（IntersectionObserver） ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add("visible");
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    for (var j = 0; j < items.length; j++) observer.observe(items[j]);
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
    html += '<p class="eyebrow">' + (lang === "zh" ? "项目详情" : "Project Detail") + '</p>';
    html += '<h2 class="modal-title" id="modal-title">' + p.name + '</h2>';
    html += '<div class="modal-meta">';
    html += '<span class="badge">' + p.badge + '</span>';
    if (p.stage) html += '<span class="stage-chip">' + p.stage + '</span>';
    html += gh;
    html += '</div>';

    if (p.background || p.done || p.goals) {
      html += '<div class="modal-stats">';
      html += '<span class="stat">' + (lang === "zh" ? "浏览量" : "Views") + ' <b>—</b></span>';
      html += '<span class="stat">' + (lang === "zh" ? "喜爱量" : "Likes") + ' <b>—</b></span>';
      html += '<span class="stat-note">' + (lang === "zh" ? "互动数据将在 V3 上线后激活" : "Interactive stats go live in V3") + '</span>';
      html += '</div>';
    }

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

    modalBody.innerHTML = html;
  }

  function openProjectModal(id) {
    if (!id) return;
    openProjectId = id;
    renderProjectModal(id);
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

  /* ---------- 6. 初始化 ---------- */
  applyTheme(detectTheme());
  applyLang(detectLang());
  initReveal();
  initNavbar();
  initModal();
  initExpand();
})();
