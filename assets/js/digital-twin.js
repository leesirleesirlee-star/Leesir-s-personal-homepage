/* Nick 数字分身：方舟文本问答 + 火山 ASR / TTS 半双工语音。密钥不进入浏览器。 */
(function () {
  "use strict";

  var config = null;
  var history = [];
  var sending = false;
  var voice = null;
  var activeAudio = null;

  function t(key) { return config.text(key); }
  function byId(id) { return document.getElementById(id); }
  function scrollToLatest() {
    var scroll = byId("chat-scroll");
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
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

    config.loadSupabase().then(function (sb) {
      return sb.functions.invoke("digital-twin-chat", {
        body: { message: message, history: priorHistory, lang: config.getLang() }
      });
    }).then(function (result) {
      if (result.error || !result.data || !result.data.answer) {
        throw new Error(result.error ? result.error.message : "Empty response");
      }
      var answer = result.data.answer;
      loading.classList.remove("chat-loading");
      loading.textContent = answer;
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

  function failVoice(key, loading) {
    if (loading) {
      loading.classList.remove("chat-loading");
      loading.textContent = t("chat.voiceError");
      loading.parentElement.classList.add("chat-bubble-error");
    }
    resetVoice();
    setStatus(key || "chat.voiceFallback");
  }

  function stopActiveAudio() {
    if (activeAudio && !activeAudio.paused) activeAudio.pause();
  }

  function attachAudio(paragraph, audioBase64) {
    var bytes = bytesFromBase64(audioBase64);
    var url = URL.createObjectURL(new Blob([bytes], { type: "audio/mp3" }));
    var audio = new Audio(url);
    audio.preload = "metadata";

    var button = document.createElement("button");
    button.type = "button";
    button.className = "chat-audio-button";
    button.setAttribute("data-playing", "false");
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", t("chat.audioPlay"));
    button.innerHTML =
      '<span class="chat-audio-button__icon" aria-hidden="true">' +
        '<svg class="chat-audio-icon chat-audio-icon--play" viewBox="0 0 16 16">' +
          '<path d="M5 3.4v9.2l7.2-4.6L5 3.4Z" fill="currentColor"/>' +
        '</svg>' +
        '<svg class="chat-audio-icon chat-audio-icon--pause" viewBox="0 0 16 16">' +
          '<rect x="4" y="3.2" width="2.6" height="9.6" rx="1" fill="currentColor"/>' +
          '<rect x="9.4" y="3.2" width="2.6" height="9.6" rx="1" fill="currentColor"/>' +
        '</svg>' +
      '</span>' +
      '<span class="chat-audio-button__label"></span>';
    var label = button.querySelector(".chat-audio-button__label");
    label.textContent = t("chat.audioPlay");
    paragraph.parentElement.appendChild(button);

    function render(isPlaying) {
      button.setAttribute("data-playing", isPlaying ? "true" : "false");
      button.setAttribute("aria-pressed", isPlaying ? "true" : "false");
      button.setAttribute("aria-label", isPlaying ? t("chat.audioPause") : t("chat.audioPlay"));
      label.textContent = isPlaying ? t("chat.audioPause") : t("chat.audioPlay");
    }

    button.addEventListener("click", function () {
      if (!audio.paused) {
        audio.pause();
        return;
      }
      stopActiveAudio();
      activeAudio = audio;
      audio.play().catch(function (error) {
        console.error("Digital twin audio playback failed:", error);
        render(false);
        setStatus("chat.audioFailed");
      });
    });
    audio.addEventListener("play", function () {
      render(true);
      setStatus("chat.speaking");
    });
    audio.addEventListener("pause", function () {
      if (audio.ended) return;
      render(false);
      setStatus("chat.voiceReady");
    });
    audio.addEventListener("ended", function () {
      activeAudio = null;
      render(false);
      setStatus("chat.voiceReady");
    });
    audio.addEventListener("error", function () {
      activeAudio = null;
      render(false);
      setStatus("chat.audioFailed");
    });
    window.addEventListener("pagehide", function () {
      audio.pause();
      URL.revokeObjectURL(url);
    }, { once: true });

    render(false);
    setStatus("chat.voiceReady");
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
      return config.loadSupabase().then(function (sb) {
        return sb.functions.invoke("digital-twin-voice", { body: form });
      });
    }).then(function (result) {
      if (result.error || !result.data || !result.data.answer) {
        throw new Error(result.error ? result.error.message : "Incomplete voice response");
      }
      question.classList.remove("chat-loading");
      question.textContent = result.data.transcript || t("chat.noTranscript");
      loading.classList.remove("chat-loading");
      loading.textContent = result.data.answer;
      if (result.data.transcript) remember(result.data.transcript, result.data.answer);
      resetVoice();
      if (result.data.audioBase64) {
        attachAudio(loading, result.data.audioBase64);
      } else {
        setStatus("chat.ttsFallback");
      }
      scrollToLatest();
    }).catch(function (error) {
      console.error("Digital twin voice request failed:", error);
      removeMessage(question);
      failVoice("chat.voiceFallback", loading);
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
    stopActiveAudio();
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
      failVoice("chat.voiceUnsupported");
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
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && voice && voice.recorder && voice.recorder.state === "recording") {
        voice.recorder.stop();
      }
    });
  }

  window.NickDigitalTwin = { init: init };
})();
