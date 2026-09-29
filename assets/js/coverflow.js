/* ============================================================
   V5 · 摄影展画廊（Cover Flow）— 自包含模块
   原理：腾讯云《.NET MAUI 复刻苹果 Cover Flow》五要素的 Web 实现
   1) 索引驱动位置算法  2) CSS 3D 透视旋转  3) 伪元素镜像倒影
   4) 400ms CubicInOut 同步缓动  5) 视口比例参数（step/pad）
   ============================================================ */
(function () {
  "use strict";

  /* ---- 照片清单：顺序 = 交付时间线（2025-07 → 2026-09）；调整顺序改这里 ---- */
  var PHOTOS = [];
  for (var i = 1; i <= 9; i++) {
    var id = (i < 10 ? "0" : "") + i;
    PHOTOS.push({
      thumb: "assets/img/gallery/thumb-" + id + ".jpg",
      display: "assets/img/gallery/photo-" + id + ".jpg",
      full: "assets/img/gallery/full-" + id + ".jpg"
    });
  }

  /* ---- 参数（对应 docs/v5-design.md §5 视觉规格） ---- */
  var STEP_VW = 0.12;          /* 相邻卡间距 = 屏宽 × 0.12（文章同款比例） */
  var PAD_VW = 0.15;           /* 中央与两侧首张的额外间距 = 屏宽 × 0.15 */
  var ANGLE = 60;              /* 侧卡 rotateY（左 + / 右 −） */
  var DIM_STEP = 0.18;         /* 每远一档的亮度衰减 */
  var WHEEL_COOLDOWN = 300;    /* 滚轮节流（ms）——一次手势一档 */
  var SWIPE_THRESHOLD = 40;    /* 滑动判定阈值（px） */
  var STAGGER = 55;            /* 入场错峰（ms/张） */

  var overlay = document.getElementById("gallery-overlay");
  var stage = overlay ? overlay.querySelector(".gallery-stage") : null;
  var flow = document.getElementById("gallery-flow");
  var counterEl = document.getElementById("gallery-counter");
  var closeBtn = document.getElementById("gallery-close");
  var lightbox = document.getElementById("gallery-lightbox");
  var lightboxImg = document.getElementById("gallery-lightbox-img");
  var entryCard = document.querySelector("[data-gallery-open]");
  if (!overlay || !flow || !entryCard) return;

  var current = 0;
  var cards = [];
  var built = false;
  var isOpen = false;
  var lightboxOpen = false;
  var lastWheel = 0;
  var lastSwipe = 0;
  var reducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  /* ---- DOM 构建（首次打开时懒构建，首屏零开销） ---- */
  function build() {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < PHOTOS.length; i++) {
      var fig = document.createElement("figure");
      fig.className = "gf-card";
      fig.setAttribute("data-index", String(i));
      fig.setAttribute("tabindex", "0");

      var refl = document.createElement("div");
      refl.className = "gf-reflection";
      var rimg = document.createElement("img");
      rimg.src = PHOTOS[i].thumb;
      rimg.alt = "";
      rimg.draggable = false;
      refl.appendChild(rimg);

      var photo = document.createElement("div");
      photo.className = "gf-photo";
      var img = document.createElement("img");
      img.src = PHOTOS[i].thumb;
      img.alt = "摄影作品 " + (i + 1);
      img.draggable = false;
      img.loading = "lazy";
      img.decoding = "async";
      photo.appendChild(img);

      fig.appendChild(refl);
      fig.appendChild(photo);
      frag.appendChild(fig);
      cards.push(fig);
    }
    flow.appendChild(frag);
    built = true;
  }

  /* ---- 核心渲染：索引驱动位置算法（文章要素 1/2/5） ---- */
  function render() {
    var w = flow.clientWidth || window.innerWidth;
    var step = Math.max(64, w * STEP_VW);
    var pad = Math.max(90, w * PAD_VW);
    var total = PHOTOS.length;

    for (var i = 0; i < total; i++) {
      var el = cards[i];
      var offset = i - current;
      var abs = Math.abs(offset);

      var x, angle, dim, scale;
      if (offset === 0) {
        x = 0; angle = 0; dim = 1; scale = 1;
      } else {
        /* 左卡面朝中心（rotateY 正），右卡镜像（负）；近大远小用 scale 近似 */
        x = (offset < 0 ? -1 : 1) * (pad + (abs - 1) * step);
        angle = (offset < 0 ? 1 : -1) * ANGLE;
        dim = Math.max(0.35, 1 - abs * DIM_STEP);
        scale = Math.max(0.7, 1 - abs * 0.06);
      }

      el.style.zIndex = String(total - abs + 10);
      el.style.setProperty("--gf-dim", dim.toFixed(3));
      el.style.visibility = abs > 5 ? "hidden" : "visible";
      el.style.transform = "translate(-50%, -50%) translateX(" + x.toFixed(1) +
        "px) rotateY(" + angle + "deg) scale(" + scale.toFixed(3) + ")";
      el.setAttribute("aria-hidden", offset === 0 ? "false" : "true");
    }

    counterEl.textContent = pad2(current + 1) + " / " + pad2(total);
  }

  /* ---- 相邻 ±2 预加载：当前展示图 + 大图 ---- */
  function preloadAround() {
    for (var d = -2; d <= 2; d++) {
      var i = current + d;
      if (i < 0 || i >= PHOTOS.length) continue;
      var im = new Image();
      im.src = PHOTOS[i].display;
      if (d === 0) { var f = new Image(); f.src = PHOTOS[i].full; }
    }
  }

  /* ---- 翻页与边界回弹 ---- */
  function bump(dir) {
    flow.classList.remove("bump-left", "bump-right");
    void flow.offsetWidth; /* 重启动画 */
    flow.classList.add(dir < 0 ? "bump-left" : "bump-right");
  }

  function go(dir) {
    var next = current + dir;
    if (next < 0 || next > PHOTOS.length - 1) { bump(dir); return; }
    current = next;
    render();
    preloadAround();
  }

  /* ---- 大图查看（lightbox：原始比例，无信息层） ---- */
  function openLightbox(i) {
    lightboxImg.src = PHOTOS[i].full;
    lightboxImg.alt = "摄影作品 " + (i + 1) + "（原图）";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    lightboxOpen = true;
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxOpen = false;
  }

  /* ---- 打开画廊：中心堆叠 → 错峰落位（入场编排） ---- */
  function openGallery() {
    if (isOpen) return;
    if (!built) { build(); bindCards(); }
    isOpen = true;
    document.body.style.overflow = "hidden"; /* scroll lock */
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");

    current = 0;
    var i;
    for (i = 0; i < cards.length; i++) {
      cards[i].classList.remove("live");
      cards[i].style.transitionDelay = "0ms";
      cards[i].style.transform =
        "translate(-50%, -50%) translateX(0px) rotateY(0deg) scale(0.55)";
    }
    void overlay.offsetWidth; /* 强制回流，确保初始态生效 */

    var stagger = reducedMotion ? 0 : STAGGER;
    for (i = 0; i < cards.length; i++) {
      cards[i].style.transitionDelay = (i * stagger) + "ms";
      cards[i].classList.add("live");
    }
    render();
    preloadAround();

    setTimeout(function () {
      for (var k = 0; k < cards.length; k++) cards[k].style.transitionDelay = "0ms";
    }, stagger * cards.length + 450);

    closeBtn.focus();
  }

  function closeGallery() {
    if (!isOpen) return;
    if (lightboxOpen) closeLightbox();
    isOpen = false;
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (entryCard) entryCard.focus(); /* 焦点回到入口卡片 */
  }

  /* ---- 交互：卡片点击 / 键盘 ---- */
  function bindCards() {
    for (var i = 0; i < cards.length; i++) {
      (function (idx) {
        cards[idx].addEventListener("click", function () {
          if (!isOpen) return;
          if (Date.now() - lastSwipe < 400) return; /* 滑动后的误触点击 */
          if (idx === current) openLightbox(idx);
          else { current = idx; render(); preloadAround(); }
        });
        cards[idx].addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (idx === current) openLightbox(idx);
            else { current = idx; render(); preloadAround(); }
          }
        });
      })(i);
    }
  }

  function onWheel(e) {
    if (!isOpen || lightboxOpen) return;
    var delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 4) return;
    e.preventDefault();
    var now = Date.now();
    if (now - lastWheel < WHEEL_COOLDOWN) return; /* 触摸板惯性 → 一档一翻 */
    lastWheel = now;
    go(delta > 0 ? 1 : -1);
  }

  function onKeyDown(e) {
    if (!isOpen) return;
    if (lightboxOpen) {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") closeLightbox();
      return;
    }
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    else if (e.key === "Escape") closeGallery();
  }

  /* ---- 交互：触摸（滑动翻页 / 下滑关闭 / 防误触） ---- */
  var tStartX = 0, tStartY = 0, tHandled = false;

  function onTouchStart(e) {
    if (!isOpen) return;
    tStartX = e.touches[0].clientX;
    tStartY = e.touches[0].clientY;
    tHandled = false;
  }

  function onTouchMove(e) {
    if (!isOpen || tHandled) return;
    var dx = e.touches[0].clientX - tStartX;
    var dy = e.touches[0].clientY - tStartY;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.2) {
      tHandled = true;
      lastSwipe = Date.now();
      go(dx < 0 ? 1 : -1); /* 左滑 = 下一张 */
    } else if (dy > 90 && Math.abs(dx) < 40 && !lightboxOpen) {
      tHandled = true; /* 下滑关闭 */
      closeGallery();
    }
  }

  /* ---- 事件绑定与初始化 ---- */
  overlay.addEventListener("wheel", onWheel, { passive: false });
  document.addEventListener("keydown", onKeyDown);
  stage.addEventListener("touchstart", onTouchStart, { passive: true });
  stage.addEventListener("touchmove", onTouchMove, { passive: true });

  closeBtn.addEventListener("click", closeGallery);
  lightbox.addEventListener("click", closeLightbox);

  /* 点击幕布空白处关闭（卡片/按钮/大图内部点击不冒泡到此逻辑） */
  overlay.addEventListener("click", function (e) {
    if (!isOpen || lightboxOpen) return;
    if (e.target === overlay || e.target === stage || e.target === flow) {
      closeGallery();
    }
  });

  window.addEventListener("resize", function () {
    if (isOpen) render();
  });

  entryCard.addEventListener("click", openGallery);
  entryCard.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openGallery();
    }
  });
})();
