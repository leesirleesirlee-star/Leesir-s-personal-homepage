/* Nick 数字分身：方舟文本问答 + 火山 ASR / TTS 半双工语音。密钥不进入浏览器。 */
(function () {
  "use strict";

  var config = null;
  var history = [];
  var sending = false;
  var voice = null;
  var activePlaybackStop = null;
  var preferredApiBase = null;
  var languageRefreshers = [];

  function t(key) { return config.text(key); }
  function byId(id) { return document.getElementById(id); }
  function scrollToLatest() {
    var scroll = byId("chat-scroll");
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
  }

  function copyFallback(value) {
    var area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-9999px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.focus();
    area.select();
    area.setSelectionRange(0, area.value.length);
    var copied = false;
    try { copied = document.execCommand("copy"); } catch (error) { copied = false; }
    document.body.removeChild(area);
    if (!copied) return Promise.reject(new Error("Copy unavailable"));
    return Promise.resolve();
  }

  function copyToClipboard(value) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value).catch(function () {
        return copyFallback(value);
      });
    }
    return copyFallback(value);
  }

  function shareAnswer(value) {
    var shareUrl = window.location.href;
    try {
      var target = new URL(window.location.href);
      target.searchParams.set("view", "chat");
      shareUrl = target.toString();
    } catch (error) {
      /* 保留当前地址。 */
    }
    if (navigator.share) {
      return navigator.share({
        title: "Nick Lee — Digital Twin",
        text: value,
        url: shareUrl
      }).then(function () {
        return { shared: true };
      }).catch(function (error) {
        if (error && error.name === "AbortError") return { cancelled: true };
        return copyToClipboard(value).then(function () { return { copied: true }; });
      });
    }
    return copyToClipboard(value).then(function () { return { copied: true }; });
  }

  function answerHash(value) {
    var hash = 2166136261;
    var text = value || "";
    for (var i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function readFeedbackState(value) {
    try {
      var stored = window.localStorage.getItem("nick-chat-feedback:" + answerHash(value));
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  }

  function writeFeedbackState(value, patch) {
    try {
      var state = readFeedbackState(value);
      for (var key in patch) {
        if (Object.prototype.hasOwnProperty.call(patch, key)) state[key] = patch[key];
      }
      window.localStorage.setItem("nick-chat-feedback:" + answerHash(value), JSON.stringify(state));
    } catch (error) {
      /* 隐私模式下 localStorage 可能不可用，不阻断界面反馈。 */
    }
  }

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

  function submitChatFeedback(kind, reason, answer) {
    if (/[?&]preview=/.test(window.location.search)) {
      return Promise.resolve();
    }
    if (!config || typeof config.loadSupabase !== "function") {
      return Promise.reject(new Error("Supabase unavailable"));
    }
    var prefix = kind === "love"
      ? "【数字分身回答评价】喜爱"
      : "【数字分身回答报告】原因：" + reason;
    var content = (prefix + "\n\n回答：\n" + (answer || "")).slice(0, 1900);
    return config.loadSupabase().then(function (sb) {
      return sb.from("feedback").insert({
        content: content,
        contact: null,
        relationship: "other",
        device_type: detectDeviceType(),
        device_info: collectDeviceInfo(),
        lang: config.getLang(),
        page: kind === "love" ? "chat-love" : "chat-report"
      });
    }).then(function (result) {
      if (!result || result.error) {
        throw new Error(result && result.error ? result.error.message : "Feedback failed");
      }
    });
  }

  function apiError(message, code, status, retryable) {
    var error = new Error(message || "API request failed");
    error.code = code || "API_ERROR";
    error.status = status || 0;
    error.retryable = !!retryable;
    return error;
  }

  function apiBases() {
    var bases = [];
    function add(base) {
      if (!base) return;
      var clean = String(base).replace(/\/+$/, "");
      if (bases.indexOf(clean) < 0) bases.push(clean);
    }
    add(preferredApiBase);
    add(config.apiBase);
    add(config.functionsUrl);
    add(config.supabaseUrl);
    return bases;
  }

  function functionEndpoint(base, name) {
    if (/\.functions\.supabase\.co$/i.test(base)) return base + "/" + name;
    return base + "/functions/v1/" + name;
  }

  /* 优先同源 Pages Function 反代，失败后回退 Supabase 直连；错误体保留业务 code。 */
  function callFunction(name, options) {
    options = options || {};
    var bases = apiBases();
    var lastError = null;
    var anonKey = config.supabaseAnonKey || "";

    function attempt(index) {
      if (index >= bases.length) {
        return Promise.reject(lastError || apiError("API unavailable", "NETWORK", 0, false));
      }
      var base = bases[index];
      var controller = new AbortController();
      var externalSignal = options.signal;
      var abortedByCaller = false;
      var timer = window.setTimeout(function () {
        controller.abort();
      }, options.timeout || 60000);
      function onExternalAbort() {
        abortedByCaller = true;
        controller.abort();
      }
      if (externalSignal) {
        if (externalSignal.aborted) onExternalAbort();
        else externalSignal.addEventListener("abort", onExternalAbort, { once: true });
      }

      var headers = {
        "apikey": anonKey,
        "Authorization": "Bearer " + anonKey
      };
      var body = options.body;
      if (!(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(body || {});
      }

      return window.fetch(functionEndpoint(base, name), {
        method: "POST",
        headers: headers,
        body: body,
        signal: controller.signal
      }).then(function (response) {
        return response.text().then(function (text) {
          var data = null;
          try { data = JSON.parse(text); } catch (error) { data = null; }
          if (!data) {
            throw apiError("API relay unavailable", "RELAY_UNAVAILABLE", response.status, true);
          }
          if (!response.ok) {
            throw apiError(
              data.error || ("HTTP " + response.status),
              data.code || "HTTP_ERROR",
              response.status,
              response.status === 401 || response.status === 403 || response.status === 404 || response.status >= 500
            );
          }
          preferredApiBase = base;
          window.clearTimeout(timer);
          if (externalSignal) externalSignal.removeEventListener("abort", onExternalAbort);
          return data;
        });
      }).catch(function (error) {
        window.clearTimeout(timer);
        if (externalSignal) externalSignal.removeEventListener("abort", onExternalAbort);
        if (abortedByCaller) throw error;
        if (error && error.name === "AbortError") {
          error = apiError("API request timed out", "TIMEOUT", 0, true);
        }
        if (!error || !error.code) {
          error = apiError(error && error.message, "NETWORK", 0, true);
        }
        lastError = error;
        if (error.retryable && index + 1 < bases.length) return attempt(index + 1);
        throw error;
      });
    }

    return attempt(0);
  }

  function stopActivePlayback() {
    if (!activePlaybackStop) return;
    var stop = activePlaybackStop;
    activePlaybackStop = null;
    stop();
  }

  function closeAllActionMenus(except) {
    var open = document.querySelectorAll(".chat-actions.is-menu-open");
    for (var i = 0; i < open.length; i++) {
      if (except && open[i] === except) continue;
      open[i].classList.remove("is-menu-open");
      var menu = open[i].querySelector(".chat-actions__menu");
      var more = open[i].querySelector('[data-action="more"]');
      var restoreFocus = open[i].contains(document.activeElement);
      if (menu) menu.hidden = true;
      if (more) {
        more.setAttribute("aria-expanded", "false");
        if (restoreFocus) more.focus({ preventScroll: true });
      }
    }
  }

  function addMessage(role, text, loading) {
    var row = document.createElement("div");
    row.className = "chat-msg chat-msg--" + (role === "user" ? "user" : "ai");
    if (role !== "user") {
      var avatar = document.createElement("span");
      avatar.className = "chat-avatar";
      avatar.setAttribute("aria-hidden", "true");
      var img = document.createElement("img");
      img.src = "assets/img/avatar-112.jpg";
      img.alt = "";
      img.width = 28;
      img.height = 28;
      avatar.appendChild(img);
      row.appendChild(avatar);
    }
    var bubble = document.createElement("div");
    bubble.className = role === "user" ? "chat-bubble-user" : "chat-bubble-ai";
    var paragraph = document.createElement("p");
    paragraph.textContent = text || "";
    if (loading) {
      paragraph.className = "chat-loading";
      paragraph.setAttribute("aria-label", t("chat.thinking"));
    }
    bubble.appendChild(paragraph);
    row.appendChild(bubble);
    byId("chat-thread").appendChild(row);
    scrollToLatest();
    return paragraph;
  }

  function removeMessage(paragraph) {
    var bubble = paragraph && paragraph.parentElement;
    var row = bubble && bubble.parentElement;
    if (row) row.remove();
  }

  function hideChips() {
    var chips = byId("chat-chips");
    if (chips) chips.hidden = true;
  }

  function setStatus(key) {
    byId("chat-status").textContent = key ? t(key) : "";
  }

  function setVoiceState(state) {
    var button = byId("chat-voice");
    button.classList.toggle("is-recording", state === "recording");
    button.classList.toggle("is-busy", state !== "idle" && state !== "recording");
    button.setAttribute("aria-label", state === "recording" ? t("chat.voiceStop") : t("chat.voiceStart"));
    button.setAttribute("aria-pressed", state === "recording" ? "true" : "false");
  }

  function setSending(value) {
    sending = value;
    var input = byId("chat-input");
    byId("chat-send").disabled = value || !input.value.trim();
    input.disabled = value;
  }

  function remember(message, answer) {
    history.push({ role: "user", content: message }, { role: "assistant", content: answer });
    history = history.slice(-8);
  }

  function sendText() {
    var input = byId("chat-input");
    var message = input.value.trim();
    if (!message || sending || voice) return;
    hideChips();
    var priorHistory = history.slice();
    addMessage("user", message);
    input.value = "";
    setSending(true);
    setStatus("chat.thinking");
    var loading = addMessage("ai", "…", true);

    callFunction("digital-twin-chat", {
      body: { message: message, history: priorHistory, lang: config.getLang() },
      timeout: 60000
    }).then(function (data) {
      if (!data || !data.answer) throw new Error("Empty response");
      var answer = data.answer;
      loading.classList.remove("chat-loading");
      loading.textContent = answer;
      attachActions(loading.parentElement, loading);
      remember(message, answer);
      setStatus("");
    }).catch(function (error) {
      console.error("Digital twin text request failed:", error);
      loading.classList.remove("chat-loading");
      loading.textContent = t("chat.textError");
      loading.parentElement.classList.add("chat-bubble-error");
      setStatus("chat.voiceFallback");
    }).finally(function () {
      setSending(false);
      byId("chat-input").focus();
      scrollToLatest();
    });
  }

  function bytesFromBase64(value) {
    var binary = atob(value);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function encodeWav(audioBuffer) {
    var outputRate = 16000;
    var ratio = audioBuffer.sampleRate / outputRate;
    var length = Math.max(1, Math.floor(audioBuffer.length / ratio));
    var samples = new Float32Array(length);
    for (var i = 0; i < length; i++) {
      var position = i * ratio;
      var left = Math.floor(position);
      var right = Math.min(left + 1, audioBuffer.length - 1);
      var mix = position - left;
      var sum = 0;
      for (var channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        var data = audioBuffer.getChannelData(channel);
        sum += data[left] * (1 - mix) + data[right] * mix;
      }
      samples[i] = sum / audioBuffer.numberOfChannels;
    }

    var buffer = new ArrayBuffer(44 + samples.length * 2);
    var view = new DataView(buffer);
    function writeString(offset, value) {
      for (var j = 0; j < value.length; j++) view.setUint8(offset + j, value.charCodeAt(j));
    }
    writeString(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, outputRate, true);
    view.setUint32(28, outputRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, samples.length * 2, true);
    for (var k = 0; k < samples.length; k++) {
      var sample = Math.max(-1, Math.min(1, samples[k]));
      view.setInt16(44 + k * 2, sample < 0 ? sample * 32768 : sample * 32767, true);
    }
    return new Blob([buffer], { type: "audio/wav" });
  }

  function normalizeRecording(blob, mimeType) {
    if (mimeType.indexOf("audio/ogg") === 0) return Promise.resolve(blob);
    var AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return Promise.reject(new Error("AudioContext unavailable"));
    var context = new AudioContextClass();
    return blob.arrayBuffer().then(function (data) {
      return context.decodeAudioData(data);
    }).then(function (decoded) {
      return encodeWav(decoded);
    }).finally(function () {
      if (context.state !== "closed") context.close();
    });
  }

  function stopMedia() {
    if (!voice) return;
    if (voice.maxTimer) clearTimeout(voice.maxTimer);
    if (voice.stream) voice.stream.getTracks().forEach(function (track) { track.stop(); });
    voice.stream = null;
  }

  function resetVoice() {
    stopMedia();
    voice = null;
    setVoiceState("idle");
    setSending(false);
  }

  function failVoice(key, loading, bubbleKey) {
    if (loading) {
      loading.classList.remove("chat-loading");
      loading.textContent = t(bubbleKey || "chat.voiceError");
      loading.parentElement.classList.add("chat-bubble-error");
    }
    resetVoice();
    setStatus(key || "chat.voiceFallback");
  }

  function createAudio(audioBase64) {
    var bytes = bytesFromBase64(audioBase64);
    var objectUrl = URL.createObjectURL(new Blob([bytes], { type: "audio/mp3" }));
    var nextAudio = new Audio(objectUrl);
    nextAudio.preload = "metadata";
    return { audio: nextAudio, objectUrl: objectUrl };
  }

  function attachActions(bubble, paragraph, audioBase64) {
    if (!bubble || !paragraph || bubble.querySelector(".chat-actions")) return;

    var answerText = paragraph.textContent || "";
    var feedback = readFeedbackState(answerText);
    var audio = null;
    var objectUrl = null;
    var generationAbort = null;
    var generating = false;
    var hintTimer = null;
    var reporting = false;

    if (audioBase64) {
      try {
        var created = createAudio(audioBase64);
        audio = created.audio;
        objectUrl = created.objectUrl;
      } catch (error) {
        console.error("Digital twin audio setup failed:", error);
      }
    }

    var actions = document.createElement("div");
    actions.className = "chat-actions";
    actions.setAttribute("role", "group");
    actions.innerHTML = [
      '<button class="chat-action" type="button" data-action="copy">',
        '<svg class="chat-action__copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
          '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="3"></rect>',
          '<path d="M5.8 15.5H5A2.5 2.5 0 0 1 2.5 13V5A2.5 2.5 0 0 1 5 2.5h8A2.5 2.5 0 0 1 15.5 5v.8"></path>',
        '</svg>',
        '<svg class="chat-action__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
          '<path d="m5 12.5 4.3 4.3L19 7"></path>',
        '</svg>',
      '</button>',
      '<div class="chat-actions__speak-wrap">',
        '<button class="chat-action" type="button" data-action="speak">',
          '<span class="chat-action__speaker" aria-hidden="true">',
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">',
              '<path d="M11.2 4.5 6.8 8.1H3.6v7.8h3.2l4.4 3.6V4.5Z"></path>',
              '<path d="M15.2 8.7a4.7 4.7 0 0 1 0 6.6"></path>',
              '<path d="M18.2 6a8.6 8.6 0 0 1 0 12"></path>',
            '</svg>',
          '</span>',
          '<span class="chat-action__wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span>',
        '</button>',
        '<span class="chat-action__hint" role="status" aria-live="polite" hidden></span>',
      '</div>',
      '<button class="chat-action" type="button" data-action="share">',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
          '<path d="M12 15V3.5"></path>',
          '<path d="m7.7 7.8 4.3-4.3 4.3 4.3"></path>',
          '<path d="M5 12.5v6A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5v-6"></path>',
        '</svg>',
      '</button>',
      '<div class="chat-actions__more-wrap">',
        '<button class="chat-action" type="button" data-action="more" aria-haspopup="menu" aria-expanded="false">',
          '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">',
            '<circle cx="5.5" cy="12" r="1.55"></circle>',
            '<circle cx="12" cy="12" r="1.55"></circle>',
            '<circle cx="18.5" cy="12" r="1.55"></circle>',
          '</svg>',
        '</button>',
        '<div class="chat-actions__menu" role="menu" hidden>',
          '<div class="chat-actions__main">',
            '<button class="chat-actions__item" type="button" role="menuitemcheckbox" data-action="love" aria-checked="false">',
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
                '<path d="M20.8 5.8a5.2 5.2 0 0 0-7.4 0L12 7.2l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 22l8.8-8.8a5.2 5.2 0 0 0 0-7.4Z"></path>',
              '</svg>',
              '<span class="chat-actions__label"></span>',
            '</button>',
            '<button class="chat-actions__item" type="button" role="menuitem" data-action="report">',
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
                '<path d="M5 21V4"></path>',
                '<path d="M5 5.5c4-2.5 7-2.5 11 0s5.5 1.5 5.5 1.5v8c-3.5 0-6.5-2-10.5 0S5 17 5 17"></path>',
              '</svg>',
              '<span class="chat-actions__label"></span>',
              '<svg class="chat-actions__chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
                '<path d="m6 3.5 4.5 4.5L6 12.5"></path>',
              '</svg>',
            '</button>',
          '</div>',
          '<div class="chat-actions__report" hidden>',
            '<button class="chat-actions__back" type="button" data-action="back">',
              '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
                '<path d="M10 3.5 5.5 8l4.5 4.5"></path>',
              '</svg>',
              '<span></span>',
            '</button>',
            '<p class="chat-actions__menu-title chat-actions__menu-title--report"></p>',
            '<button class="chat-actions__reason" type="button" data-reason="inaccurate"></button>',
            '<button class="chat-actions__reason" type="button" data-reason="offtopic"></button>',
            '<button class="chat-actions__reason" type="button" data-reason="inappropriate"></button>',
          '</div>',
          '<p class="chat-actions__note" role="status" aria-live="polite"></p>',
        '</div>',
      '</div>'
    ].join("");
    bubble.appendChild(actions);

    var copyBtn = actions.querySelector('[data-action="copy"]');
    var speakBtn = actions.querySelector('[data-action="speak"]');
    var speakHint = actions.querySelector(".chat-action__hint");
    var shareBtn = actions.querySelector('[data-action="share"]');
    var moreBtn = actions.querySelector('[data-action="more"]');
    var menu = actions.querySelector(".chat-actions__menu");
    var mainPanel = actions.querySelector(".chat-actions__main");
    var reportPanel = actions.querySelector(".chat-actions__report");
    var reportTitle = actions.querySelector(".chat-actions__menu-title--report");
    var backBtn = actions.querySelector('[data-action="back"]');
    var loveBtn = actions.querySelector('[data-action="love"]');
    var loveLabel = loveBtn.querySelector(".chat-actions__label");
    var reportBtn = actions.querySelector('[data-action="report"]');
    var note = actions.querySelector(".chat-actions__note");
    var reasons = actions.querySelectorAll(".chat-actions__reason");

    function refreshLanguage() {
      actions.setAttribute("aria-label", t("chat.actionsLabel"));
      copyBtn.setAttribute("aria-label", t("chat.copy"));
      copyBtn.title = t("chat.copy");
      shareBtn.setAttribute("aria-label", t("chat.share"));
      shareBtn.title = t("chat.share");
      moreBtn.setAttribute("aria-label", t("chat.more"));
      moreBtn.title = t("chat.more");
      menu.setAttribute("aria-label", t("chat.more"));
      loveLabel.textContent = feedback.loved ? t("chat.loved") : t("chat.love");
      reportBtn.querySelector(".chat-actions__label").textContent = t("chat.report");
      backBtn.querySelector("span").textContent = t("chat.reportBack");
      reportTitle.textContent = t("chat.reportTitle");
      actions.querySelector('[data-reason="inaccurate"]').textContent = t("chat.reportInaccurate");
      actions.querySelector('[data-reason="offtopic"]').textContent = t("chat.reportOffTopic");
      actions.querySelector('[data-reason="inappropriate"]').textContent = t("chat.reportInappropriate");
      renderSpeaking(speakBtn.classList.contains("is-playing"));
    }
    languageRefreshers.push(refreshLanguage);
    refreshLanguage();

    function currentAnswer() {
      return paragraph.textContent || "";
    }

    function hideHint() {
      if (hintTimer) {
        window.clearTimeout(hintTimer);
        hintTimer = null;
      }
      speakHint.hidden = true;
      speakHint.textContent = "";
      speakHint.className = "chat-action__hint";
    }

    function showHint(key, options) {
      options = options || {};
      if (hintTimer) {
        window.clearTimeout(hintTimer);
        hintTimer = null;
      }
      speakHint.hidden = false;
      speakHint.textContent = t(key);
      speakHint.className = "chat-action__hint" + (options.error ? " is-error" : "");
      if (options.timeout) {
        hintTimer = window.setTimeout(hideHint, options.timeout);
      }
    }

    function renderSpeaking(playing) {
      speakBtn.classList.toggle("is-playing", playing);
      speakBtn.classList.toggle("is-generating", generating);
      actions.classList.toggle("is-speech-generating", generating);
      speakBtn.setAttribute("aria-pressed", playing ? "true" : "false");
      speakBtn.setAttribute("aria-busy", generating ? "true" : "false");
      var label = generating
        ? t("chat.audioGenerating")
        : (playing ? t("chat.audioPause") : t(audio ? "chat.audioPlay" : "chat.audioGenerate"));
      speakBtn.setAttribute("aria-label", label);
      speakBtn.title = label;
    }

    function stopGeneration() {
      if (generationAbort) {
        var controller = generationAbort;
        generationAbort = null;
        controller.abort();
      }
      if (generating) {
        generating = false;
        renderSpeaking(false);
        hideHint();
      }
    }

    function stopOwnPlayback() {
      stopGeneration();
      if (audio && !audio.paused) audio.pause();
      renderSpeaking(false);
      if (activePlaybackStop === stopOwnPlayback) activePlaybackStop = null;
    }

    function bindAudioEvents() {
      if (!audio || audio.getAttribute("data-bound") === "true") return;
      audio.setAttribute("data-bound", "true");
      audio.addEventListener("play", function () {
        hideHint();
        renderSpeaking(true);
      });
      audio.addEventListener("pause", function () {
        if (audio.ended) return;
        renderSpeaking(false);
      });
      audio.addEventListener("ended", function () {
        if (activePlaybackStop === stopOwnPlayback) activePlaybackStop = null;
        renderSpeaking(false);
      });
      audio.addEventListener("error", function () {
        if (activePlaybackStop === stopOwnPlayback) activePlaybackStop = null;
        renderSpeaking(false);
        showHint("chat.audioFailed", { error: true, timeout: 2600 });
      });
    }

    function startAudio() {
      if (!audio) return;
      try { audio.currentTime = 0; } catch (error) { /* metadata 尚未就绪时忽略。 */ }
      audio.play().catch(function (error) {
        console.error("Digital twin audio playback failed:", error);
        renderSpeaking(false);
        showHint("chat.audioFailed", { error: true, timeout: 2600 });
      });
    }

    function generateAudio() {
      if (generating) return;
      stopActivePlayback();
      activePlaybackStop = stopOwnPlayback;
      generating = true;
      generationAbort = new AbortController();
      var controller = generationAbort;
      renderSpeaking(false);
      showHint("chat.audioGenerating");

      callFunction("digital-twin-tts", {
        body: { text: currentAnswer(), lang: config.getLang() },
        timeout: 60000,
        signal: controller.signal
      }).then(function (data) {
        if (generationAbort !== controller) return;
        if (!data || !data.audioBase64) throw apiError("No audio returned", "TTS_EMPTY", 0, false);
        var created = createAudio(data.audioBase64);
        audio = created.audio;
        objectUrl = created.objectUrl;
        bindAudioEvents();
        generationAbort = null;
        generating = false;
        renderSpeaking(false);
        startAudio();
      }).catch(function (error) {
        if (generationAbort !== controller) return;
        generationAbort = null;
        generating = false;
        if (activePlaybackStop === stopOwnPlayback) activePlaybackStop = null;
        renderSpeaking(false);
        if (error && error.name === "AbortError") return;
        console.error("Digital twin voice generation failed:", error);
        showHint("chat.audioGenerateFailed", { error: true, timeout: 3000 });
      });
    }

    copyBtn.addEventListener("click", function () {
      copyToClipboard(currentAnswer()).then(function () {
        copyBtn.classList.add("is-success");
        window.setTimeout(function () { copyBtn.classList.remove("is-success"); }, 1500);
        setStatus("chat.copied");
      }).catch(function (error) {
        console.error("Digital twin copy failed:", error);
        setStatus("chat.copyFailed");
      });
    });

    speakBtn.addEventListener("click", function () {
      if (generating) {
        stopOwnPlayback();
        return;
      }
      if (audio) {
        if (!audio.paused) {
          stopOwnPlayback();
          return;
        }
        stopActivePlayback();
        activePlaybackStop = stopOwnPlayback;
        startAudio();
        return;
      }
      generateAudio();
    });

    shareBtn.addEventListener("click", function () {
      shareAnswer(currentAnswer()).then(function (result) {
        if (!result || result.cancelled) return;
        setStatus(result.copied ? "chat.shareCopied" : "chat.shared");
      }).catch(function (error) {
        console.error("Digital twin share failed:", error);
        setStatus("chat.copyFailed");
      });
    });

    function setMenuOpen(open) {
      if (open) {
        closeAllActionMenus(actions);
        actions.classList.add("is-menu-open");
      } else {
        actions.classList.remove("is-menu-open");
      }
      menu.hidden = !open;
      moreBtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        mainPanel.hidden = false;
        reportPanel.hidden = true;
        note.className = "chat-actions__note";
        note.textContent = feedback.reported ? t("chat.alreadyReported") : "";
        menu.classList.remove("chat-actions__menu--below");
        var scroll = byId("chat-scroll");
        if (scroll) {
          var menuRect = menu.getBoundingClientRect();
          var scrollRect = scroll.getBoundingClientRect();
          if (menuRect.top < scrollRect.top + 8) menu.classList.add("chat-actions__menu--below");
        }
        return;
      }
      if (actions.contains(document.activeElement)) {
        moreBtn.focus({ preventScroll: true });
      }
    }

    moreBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      var open = menu.hidden;
      setMenuOpen(open);
      if (open) {
        var first = mainPanel.querySelector("button");
        if (first) first.focus({ preventScroll: true });
      }
    });

    reportBtn.addEventListener("click", function () {
      if (feedback.reported) {
        note.className = "chat-actions__note";
        note.textContent = t("chat.alreadyReported");
        return;
      }
      mainPanel.hidden = true;
      reportPanel.hidden = false;
      note.className = "chat-actions__note";
      note.textContent = "";
      setStatus("");
      if (reasons.length) reasons[0].focus();
    });

    backBtn.addEventListener("click", function () {
      reportPanel.hidden = true;
      mainPanel.hidden = false;
      note.className = "chat-actions__note";
      note.textContent = "";
      reportBtn.focus();
    });

    loveBtn.addEventListener("click", function () {
      if (feedback.loved) {
        setMenuOpen(false);
        setStatus("chat.loved");
        return;
      }
      feedback.loved = true;
      writeFeedbackState(answerText, { loved: true });
      loveBtn.classList.add("is-loved");
      loveBtn.setAttribute("aria-checked", "true");
      loveLabel.textContent = t("chat.loved");
      setMenuOpen(false);
      setStatus("chat.loveThanks");
      submitChatFeedback("love", "", currentAnswer()).catch(function (error) {
        console.error("Digital twin love feedback failed:", error);
        setStatus("chat.feedbackFailed");
      });
    });

    for (var r = 0; r < reasons.length; r++) {
      reasons[r].addEventListener("click", function () {
        if (reporting || feedback.reported) return;
        var reasonKey = this.getAttribute("data-reason");
        var reasonLabels = {
          inaccurate: "chat.reportInaccurate",
          offtopic: "chat.reportOffTopic",
          inappropriate: "chat.reportInappropriate"
        };
        reporting = true;
        for (var j = 0; j < reasons.length; j++) reasons[j].disabled = true;
        note.className = "chat-actions__note";
        note.textContent = t("chat.reportSending");
        submitChatFeedback("report", t(reasonLabels[reasonKey]), currentAnswer()).then(function () {
          feedback.reported = true;
          writeFeedbackState(answerText, { reported: true });
          note.className = "chat-actions__note is-success";
          note.textContent = t("chat.reportThanks");
          setStatus("chat.reportThanks");
          window.setTimeout(function () { setMenuOpen(false); }, 1600);
        }).catch(function (error) {
          console.error("Digital twin report failed:", error);
          reporting = false;
          for (var k = 0; k < reasons.length; k++) reasons[k].disabled = false;
          note.className = "chat-actions__note is-error";
          note.textContent = t("chat.feedbackFailed");
          setStatus("chat.feedbackFailed");
        });
      });
    }

    bindAudioEvents();

    if (feedback.loved) {
      loveBtn.classList.add("is-loved");
      loveBtn.setAttribute("aria-checked", "true");
      loveLabel.textContent = t("chat.loved");
    }

    window.addEventListener("pagehide", function () {
      stopOwnPlayback();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }, { once: true });

    renderSpeaking(false);
  }

  function processRecording(blob, mimeType) {
    if (!voice) return;
    var current = voice;
    if (Date.now() - current.startedAt < 350 || blob.size === 0) {
      failVoice("chat.voiceTooShort");
      return;
    }
    setVoiceState("processing");
    setStatus("chat.processing");
    var question = addMessage("user", t("chat.transcribing"), true);
    var loading = addMessage("ai", "…", true);
    normalizeRecording(blob, mimeType).then(function (audioBlob) {
      if (audioBlob.size > 8 * 1024 * 1024) throw new Error("Audio too large");
      var form = new FormData();
      form.append("audio", audioBlob, audioBlob.type.indexOf("ogg") >= 0 ? "question.ogg" : "question.wav");
      form.append("history", JSON.stringify(history.slice(-6)));
      form.append("lang", config.getLang());
      return callFunction("digital-twin-voice", { body: form, timeout: 90000 });
    }).then(function (data) {
      if (!data || !data.answer) throw apiError("Incomplete voice response", "EMPTY_RESPONSE", 502, false);
      question.classList.remove("chat-loading");
      question.textContent = data.transcript || t("chat.noTranscript");
      loading.classList.remove("chat-loading");
      loading.textContent = data.answer;
      if (data.transcript) remember(data.transcript, data.answer);
      resetVoice();
      attachActions(loading.parentElement, loading, data.audioBase64 || null);
      setStatus(data.audioBase64 ? "chat.voiceReady" : "chat.audioOnDemand");
      scrollToLatest();
    }).catch(function (error) {
      console.error("Digital twin voice request failed:", error);
      removeMessage(question);
      var code = error && error.code;
      if (code === "ASR_EMPTY") {
        failVoice("chat.voiceNotRecognized", loading, "chat.voiceNotRecognized");
        return;
      }
      if (code === "NETWORK" || code === "TIMEOUT" || code === "RELAY_UNAVAILABLE") {
        failVoice("chat.voiceNetworkError", loading, "chat.voiceNetworkError");
        return;
      }
      failVoice("chat.voiceError", loading, "chat.voiceError");
    });
  }

  function startVoice() {
    if (voice) {
      if (voice.recorder && voice.recorder.state === "recording") {
        voice.recorder.stop();
        setVoiceState("processing");
        setStatus("chat.processing");
      }
      return;
    }
    if (sending) return;
    if (!navigator.mediaDevices || !window.MediaRecorder || !window.FormData) {
      setStatus("chat.voiceUnsupported");
      return;
    }
    stopActivePlayback();
    hideChips();
    setSending(true);
    setVoiceState("processing");
    setStatus("chat.voiceConnecting");
    navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    }).then(function (stream) {
      var preferred = "audio/ogg;codecs=opus";
      var mimeType = MediaRecorder.isTypeSupported(preferred) ? preferred : "";
      var recorder = new MediaRecorder(stream, mimeType ? { mimeType: preferred } : undefined);
      voice = { recorder: recorder, stream: stream, chunks: [], mimeType: mimeType, startedAt: Date.now(), maxTimer: null };
      var session = voice;
      recorder.addEventListener("dataavailable", function (event) {
        if (event.data && event.data.size) session.chunks.push(event.data);
      });
      recorder.addEventListener("stop", function () {
        var current = voice;
        if (!current) return;
        var actualType = recorder.mimeType || current.mimeType || "audio/webm";
        var blob = new Blob(current.chunks, { type: actualType });
        stopMedia();
        processRecording(blob, actualType);
      });
      recorder.addEventListener("error", function () { failVoice("chat.voiceError"); });
      recorder.start(250);
      voice.maxTimer = setTimeout(function () {
        if (voice && voice.recorder.state === "recording") voice.recorder.stop();
      }, 30000);
      setVoiceState("recording");
      setStatus("chat.listening");
    }).catch(function () {
      failVoice("chat.micError");
    });
  }

  function init(options) {
    config = options;
    var input = byId("chat-input");
    if (!input) return;
    byId("chat-send").addEventListener("click", sendText);
    byId("chat-voice").addEventListener("click", startVoice);
    input.addEventListener("input", function () {
      byId("chat-send").disabled = sending || !input.value.trim();
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        sendText();
      }
    });
    var chips = document.querySelectorAll(".chat-chip");
    for (var i = 0; i < chips.length; i++) {
      chips[i].addEventListener("click", function () {
        if (sending || voice) return;
        input.value = this.textContent;
        byId("chat-send").disabled = false;
        input.focus();
      });
    }
    var greeting = document.querySelector("#chat-thread .chat-bubble-ai");
    if (greeting) {
      var greetingText = greeting.querySelector("p");
      if (greetingText) attachActions(greeting, greetingText);
    }
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".chat-actions__more-wrap")) closeAllActionMenus();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeAllActionMenus();
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && voice && voice.recorder && voice.recorder.state === "recording") {
        voice.recorder.stop();
      }
    });
  }

  window.NickDigitalTwin = {
    init: init,
    refreshLanguage: function () {
      for (var i = 0; i < languageRefreshers.length; i++) languageRefreshers[i]();
    }
  };
})();
