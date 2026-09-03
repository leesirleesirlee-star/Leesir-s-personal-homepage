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

      "projects.eyebrow": "Projects",
      "projects.title": "项目",
      "projects.status.inprogress": "进行中",
      "projects.p1.name": "Digital Resin 数字孪生树脂",
      "projects.p1.desc": "个人研究项目，探索数字孪生（Digital Twin）技术在树脂材料领域的建模与应用。",
      "projects.p2.name": "大学志愿者论坛小程序",
      "projects.p2.desc": "面向大学志愿者社群的微信小程序，支持提出建议、发布公告等功能，服务志愿活动的组织与沟通。",
      "projects.p2.tag": "微信小程序",

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

      "projects.eyebrow": "Projects",
      "projects.title": "Projects",
      "projects.status.inprogress": "In Progress",
      "projects.p1.name": "Digital Resin",
      "projects.p1.desc": "A personal research project exploring digital twin modeling and applications for resin materials.",
      "projects.p2.name": "University Volunteer Forum",
      "projects.p2.desc": "A WeChat mini program for university volunteer communities, featuring suggestion submission and announcement publishing to support volunteer activities.",
      "projects.p2.tag": "WeChat Mini Program",

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

  /* ---------- 6. 初始化 ---------- */
  applyTheme(detectTheme());
  applyLang(detectLang());
  initReveal();
  initNavbar();
})();
