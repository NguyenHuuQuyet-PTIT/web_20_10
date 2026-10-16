/* ==========================================================================
   FILE: js/audio-engine.js
   MÔ TẢ: Bộ quản lý âm thanh (Howler-style Web Audio Synthesizer + MP3 Player)
          Tự động phát giai điệu 20/10 và hiệu ứng nổ hộp quà (SFX Pop & Fanfare)
   ========================================================================== */

window.AudioEngine2010 = (function () {
  'use strict';

  let audioCtx = null;
  let isMusicPlaying = false;
  let isSfxMuted = false;
  let melodyInterval = null;
  let melodyStep = 0;

  const MELODY_PRESETS = [
    // Giai điệu 0: Hộp Nhạc Tháng Mười Dịu Dàng
    [523.25, 659.25, 783.99, 1046.50, 880.00, 783.99, 659.25, 587.33, 523.25, 659.25, 783.99, 880.00, 783.99, 659.25, 587.33, 523.25],
    // Giai điệu 1: Chuyến Tàu Kỷ Niệm Acoustic
    [440.00, 523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 392.00, 440.00, 523.25, 659.25, 587.33, 523.25, 440.00, 523.25],
    // Giai điệu 2: Vũ Điệu Hoa Hồng Sôi Động
    [587.33, 739.99, 880.00, 1174.66, 987.77, 880.00, 739.99, 659.25, 587.33, 739.99, 880.00, 987.77, 880.00, 739.99, 659.25, 587.33]
  ];

  function ensureContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSynthNote(freq, duration = 0.45, type = 'sine', gainLevel = 0.11) {
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.exponentialRampToValueAtTime(gainLevel * 0.32, now + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.65);

      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(audioCtx.destination);
      gain2.connect(audioCtx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + duration + 0.05);
      osc2.stop(now + duration + 0.05);
    } catch (e) {}
  }

  function playPopSfx(pitchMultiplier = 1) {
    if (isSfxMuted) return;
    ensureContext();
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330 * pitchMultiplier, now);
      osc.frequency.exponentialRampToValueAtTime(890 * pitchMultiplier, now + 0.11);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.14);

      setTimeout(() => {
        playSynthNote(1046.5 * pitchMultiplier, 0.25, 'triangle', 0.12);
      }, 50);
    } catch (e) {}
  }

  function playFanfareSfx() {
    if (isSfxMuted) return;
    ensureContext();
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((n, idx) => {
      setTimeout(() => {
        playSynthNote(n, 0.55, 'triangle', 0.15);
      }, idx * 80);
    });
  }

  function updateUI(appState) {
    const disc = document.getElementById('vinylDisc');
    const icon = document.getElementById('musicPlayIcon');
    const eq = document.getElementById('audioEqBars');
    const trackName = document.getElementById('audioTrackName');
    if (trackName && appState) {
      trackName.textContent = appState.customAudioName || "Giai Điệu 20/10 Tặng 3 Bạn Nữ";
    }
    if (!disc || !icon || !eq) return;

    if (isMusicPlaying) {
      disc.classList.add('animate-spin-slow');
      icon.textContent = '⏸';
      eq.classList.remove('opacity-40');
      eq.classList.add('opacity-100');
    } else {
      disc.classList.remove('animate-spin-slow');
      icon.textContent = '▶';
      eq.classList.add('opacity-40');
      eq.classList.remove('opacity-100');
    }
  }

  function startMusic(appState) {
    ensureContext();
    const customAudio = document.getElementById('customAudioElement');
    clearInterval(melodyInterval);

    if (appState && appState.customAudioDataUrl && customAudio) {
      if (customAudio.src !== appState.customAudioDataUrl) {
        customAudio.src = appState.customAudioDataUrl;
      }
      customAudio.play().catch(() => {});
      isMusicPlaying = true;
      updateUI(appState);
      return;
    }

    if (customAudio) customAudio.pause();
    isMusicPlaying = true;
    updateUI(appState);

    const idx = appState ? appState.selectedMelodyIndex : 0;
    const melody = MELODY_PRESETS[idx] || MELODY_PRESETS[0];
    playSynthNote(melody[melodyStep % melody.length], 0.5, 'sine', 0.10);
    melodyStep++;

    melodyInterval = setInterval(() => {
      if (!isMusicPlaying) return;
      const curIdx = appState ? appState.selectedMelodyIndex : 0;
      const activeMelody = MELODY_PRESETS[curIdx] || MELODY_PRESETS[0];
      const freq = activeMelody[melodyStep % activeMelody.length];
      playSynthNote(freq, 0.55, 'sine', 0.10);

      const c1 = document.getElementById('beatPulseCircle1');
      const c2 = document.getElementById('beatPulseCircle2');
      if (c1 && c2) {
        c1.style.transform = (melodyStep % 2 === 0) ? 'scale(1.1)' : 'scale(0.94)';
        c2.style.transform = (melodyStep % 2 === 0) ? 'scale(0.9)' : 'scale(1.14)';
      }
      melodyStep++;
    }, 410);
  }

  function stopMusic(appState) {
    isMusicPlaying = false;
    clearInterval(melodyInterval);
    const customAudio = document.getElementById('customAudioElement');
    if (customAudio) customAudio.pause();
    updateUI(appState);
  }

  function toggleMusic(appState) {
    if (isMusicPlaying) {
      stopMusic(appState);
    } else {
      startMusic(appState);
    }
  }

  function toggleSfx() {
    isSfxMuted = !isSfxMuted;
    return isSfxMuted;
  }

  return {
    startMusic,
    stopMusic,
    toggleMusic,
    toggleSfx,
    updateUI,
    playPopSfx,
    playFanfareSfx,
    isPlaying: () => isMusicPlaying
  };
})();
