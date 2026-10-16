/* App interactions for the three scenes, fixed content, music, and visual effects. */


(function () {
  'use strict';

  const DEFAULT_STATE = window.DEFAULT_DATA_20_10;
  let CLASSMATES = window.CLASSMATES_PROFILES || [];

  let appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
  let activeClassmateKey = 'all';

  function showToast(msg) {
    const banner = document.getElementById('toastBanner');
    const text = document.getElementById('toastText');
    if (!banner || !text) return;
    text.textContent = msg;
    banner.classList.remove('opacity-0', 'translate-y-[-10px]');
    banner.classList.add('opacity-100', 'translate-y-0');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      banner.classList.add('opacity-0', 'translate-y-[-10px]');
      banner.classList.remove('opacity-100', 'translate-y-0');
    }, 2700);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // =========================================================================
  // HIỆU ỨNG CÁNH HOA RƠI + VỆT SÁNG LẤP LÁNH THEO CHUỘT / CẢM ỨNG
  // =========================================================================
  function initAmbientPetals() {
    const canvas = document.getElementById('ambientPetalsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const petals = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 6 + Math.random() * 8,
      speedY: 0.45 + Math.random() * 0.85,
      speedX: -0.35 + Math.random() * 0.7,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.025,
      opacity: 0.24 + Math.random() * 0.38
    }));

    const sparkles = [];
    window.addEventListener('pointermove', (e) => {
      if (sparkles.length < 38 && Math.random() > 0.25) {
        sparkles.push({
          x: e.clientX + (Math.random() - 0.5) * 14,
          y: e.clientY + (Math.random() - 0.5) * 14,
          vx: (Math.random() - 0.5) * 1.4,
          vy: -0.6 - Math.random() * 1.2,
          r: 2.5 + Math.random() * 3.5,
          alpha: 0.95,
          color: Math.random() > 0.45 ? '#F43F5E' : '#F59E0B'
        });
      }
    }, { passive: true });

    function renderPetals() {
      ctx.clearRect(0, 0, width, height);
      for (let p of petals) {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.angle) * 0.42;
        p.angle += p.spin;
        if (p.y > height + 20) {
          p.y = -15;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -15;
        if (p.x < -20) p.x = width + 15;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = `rgba(244, 63, 94, ${p.opacity})`;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, p.size / 3, 0, p.size);
        ctx.bezierCurveTo(-p.size, p.size / 3, -p.size / 2, -p.size / 2, 0, 0);
        ctx.fill();
        ctx.restore();
      }

      for (let i = sparkles.length - 1; i >= 0; i--) {
        const sp = sparkles[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= 0.024;
        if (sp.alpha <= 0) {
          sparkles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = sp.alpha;
        ctx.fillStyle = sp.color;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      requestAnimationFrame(renderPetals);
    }
    renderPetals();
  }

  // =========================================================================
  // THANH CHỌN NHANH 3 BẠN NỮ: NGUYỄN ANH THƯ, TRẦN THỊ BẢO LINH, TRẦN THỊ LƯƠNG
  // =========================================================================
  function renderClassmateSelector() {
    const bar = document.getElementById('classmateSelectorBar');
    if (!bar) return;
    bar.innerHTML = '';

    CLASSMATES.forEach((girl) => {
      const isActive = girl.key === activeClassmateKey;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = isActive
        ? 'glass-pill-active px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all scale-105'
        : 'bg-white/90 hover:bg-rose-50 text-rose-900 border border-rose-200/90 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02]';
      btn.innerHTML = `
        <span class="text-base">${girl.avatarEmoji}</span>
        <span>${escapeHtml(girl.name)}</span>
      `;
      btn.addEventListener('click', () => {
        selectClassmateProfile(girl.key, true);
      });
      bar.appendChild(btn);
    });
  }

  function selectClassmateProfile(key, triggerEffects = false) {
    activeClassmateKey = key;
    const profile = CLASSMATES.find((c) => c.key === key) || CLASSMATES[0];
    if (!profile) return;

    renderClassmateSelector();

    const badgeEl = document.getElementById('heroBadgeText');
    const wishBoxTitle = document.getElementById('activeGirlHeroTitle');
    const wishBoxDesc = document.getElementById('activeGirlHeroWish');
    const wishBoxBadge = document.getElementById('activeGirlBadge');

    if (badgeEl) badgeEl.textContent = `${profile.badge} • Chúc Mừng 20/10`;
    if (wishBoxTitle) wishBoxTitle.textContent = profile.heroTitle;
    if (wishBoxDesc) wishBoxDesc.textContent = profile.heroWish;
    if (wishBoxBadge) wishBoxBadge.textContent = profile.badge;

    const bubble = document.getElementById('mascotSpeechBubble');
    if (bubble) {
      bubble.textContent = profile.mascotGreeting;
    }

    // Đổi màu váy của Nữ Vũ Công 3D theo từng bạn nữ
    if (window.Mascot3DEngine && profile.dressColorHex) {
      window.Mascot3DEngine.setCostumeColors(profile.dressColorHex, profile.skirtColorHex);
    }

    const galMatchIdx = appState.gallery.findIndex((g) => g.classmateKey === key);
    if (galMatchIdx !== -1) {
      currentGalleryIdx = galMatchIdx;
      renderGallery();
    }

    if (triggerEffects) {
      window.AudioEngine2010.playPopSfx(1.2);
      if (typeof window.confetti === 'function') {
        window.confetti({
          particleCount: 42,
          spread: 72,
          origin: { y: 0.35 },
          colors: ['#F43F5E', '#FB7185', '#FBBF24', '#EC4899']
        });
      }
      showToast(`Đang xem thiệp 20/10 dành tặng: ${profile.name} 💖`);
    }
  }

  // =========================================================================
  // SCENE 1: RHYTHM TAP GAME (ĐẬP HỘP QUÀ THEO NHẠC)
  // =========================================================================
  let gameActive = false;
  let giftsPopped = 0;
  let gameCombo = 0;
  let gameScore = 0;
  let spawnTimer = null;
  let activeGiftIdCounter = 0;

  const GIFT_PALETTES = [
    { box: '#F43F5E', lid: '#FB7185', ribbon: '#FDE047', label: 'Nguyễn Anh Thư 🌸' },
    { box: '#D946EF', lid: '#E879F9', ribbon: '#FBCFE8', label: 'Trần Thị Bảo Linh 💖' },
    { box: '#EC4899', lid: '#F472B6', ribbon: '#FEF08A', label: 'Trần Thị Lương 🌷' },
    { box: '#F59E0B', lid: '#FBBF24', ribbon: '#FFF1F2', label: 'Mừng 20/10 ✨' }
  ];

  function renderBeatStepIndicators() {
    const container = document.getElementById('beatStepIndicators');
    if (!container) return;
    const total = Number(appState.targetGifts) || 6;
    container.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('span');
      const completed = i < giftsPopped;
      dot.className = completed
        ? 'w-5 h-5 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 text-white text-[10px] flex items-center justify-center font-bold shadow-sm transition-transform scale-110'
        : 'w-4 h-4 rounded-full bg-rose-100 border border-rose-300 text-[9px] flex items-center justify-center text-rose-400 transition-all';
      dot.textContent = completed ? '✓' : (i + 1);
      container.appendChild(dot);
    }
  }

  function updateGameHUD() {
    const total = Number(appState.targetGifts) || 6;
    const pct = Math.min(100, Math.round((giftsPopped / total) * 100));
    document.getElementById('gameProgressText').textContent = `${giftsPopped} / ${total} Hộp Quà`;
    document.getElementById('gameProgressBar').style.width = `${pct}%`;
    document.getElementById('gameComboText').textContent = `x${gameCombo} 🔥`;
    document.getElementById('gameScoreText').textContent = `${gameScore} ✨`;
    renderBeatStepIndicators();
  }

  function fireConfettiAtElement(el) {
    if (typeof window.confetti !== 'function') return;
    const rect = el.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    window.confetti({
      particleCount: 36,
      spread: 70,
      origin: { x, y },
      colors: ['#F43F5E', '#FB7185', '#FBBF24', '#F472B6', '#FFF1F2']
    });
  }

  function spawnFloatingFeedback(xPx, yPx, text) {
        const layer = document.getElementById('popFeedbackLayer');
        if (!layer) return;
        const badge = document.createElement('div');
        badge.className = 'absolute z-30 px-3.5 py-1.5 rounded-full bg-white/95 text-rose-600 font-bold text-xs shadow-lg border border-rose-200 pointer-events-none transition-all duration-700';
        badge.style.left = `${Math.max(12, Math.min(xPx - 60, layer.clientWidth - 180))}px`;
        badge.style.top = `${Math.max(20, yPx - 20)}px`;
        badge.textContent = text;
        layer.appendChild(badge);

        requestAnimationFrame(() => {
          badge.style.transform = 'translateY(-44px) scale(1.06)';
          badge.style.opacity = '0';
        });
        setTimeout(() => badge.remove(), 760);
  }

  function spawnRhythmGiftBox() {
    if (!gameActive) return;
    const total = Number(appState.targetGifts) || 6;
    if (giftsPopped >= total) return;

    const layer = document.getElementById('giftSpawnLayer');
    if (!layer) return;
    if (layer.children.length >= 3) return;

    const palette = GIFT_PALETTES[activeGiftIdCounter % GIFT_PALETTES.length];
    activeGiftIdCounter++;

    const stageW = layer.clientWidth || 320;
    const stageH = layer.clientHeight || 380;
    const boxSize = window.innerWidth < 640 ? 84 : 98;
    const minX = 18;
    const maxX = Math.max(minX + 20, stageW - boxSize - 18);
    const minY = 54;
    const maxY = Math.max(minY + 20, stageH - boxSize - 24);

    const posX = Math.floor(minX + Math.random() * (maxX - minX));
    const posY = Math.floor(minY + Math.random() * (maxY - minY));

    const giftBtn = document.createElement('button');
    giftBtn.type = 'button';
    giftBtn.setAttribute('aria-label', 'Hộp quà nhịp điệu');
    giftBtn.className = 'pointer-events-auto absolute group focus:outline-none transition-transform duration-200 hover:scale-110 active:scale-90 animate-gift-shake';
    giftBtn.style.width = `${boxSize}px`;
    giftBtn.style.height = `${boxSize}px`;
    giftBtn.style.left = `${posX}px`;
    giftBtn.style.top = `${posY}px`;

    giftBtn.innerHTML = `
      <div class="relative w-full h-full flex items-center justify-center">
        <span class="absolute inset-0 rounded-full border-2 border-rose-400/80 animate-ping"></span>
        <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-md overflow-visible">
          <path d="M50 24 C32 6, 18 22, 38 30 Z" fill="${palette.ribbon}" />
          <path d="M50 24 C68 6, 82 22, 62 30 Z" fill="${palette.ribbon}" />
          <rect x="20" y="40" width="60" height="46" rx="8" fill="${palette.box}" stroke="#FFF" stroke-width="2"/>
          <rect x="44" y="40" width="12" height="46" fill="${palette.ribbon}"/>
          <rect x="20" y="57" width="60" height="10" fill="${palette.ribbon}"/>
          <rect x="15" y="27" width="70" height="16" rx="5" fill="${palette.lid}" stroke="#FFF" stroke-width="2"/>
          <rect x="43" y="27" width="14" height="16" fill="${palette.ribbon}"/>
        </svg>
        <span class="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] bg-white/95 px-2 py-0.5 rounded-full shadow font-bold text-rose-700 border border-rose-200">${palette.label}</span>
      </div>
    `;

    let popped = false;
    const handleTap = (e) => {
      e.stopPropagation();
      if (popped || !gameActive) return;
      popped = true;

      giftsPopped++;
      gameCombo++;
      gameScore += 100 + (gameCombo * 25);

      window.AudioEngine2010.playPopSfx(1 + Math.min(0.5, giftsPopped * 0.06));
      fireConfettiAtElement(giftBtn);

      const compliments = appState.miniCompliments || DEFAULT_STATE.miniCompliments;
      const compliment = compliments[(giftsPopped - 1) % compliments.length];
      spawnFloatingFeedback(posX, posY, compliment);

      giftBtn.style.transform = 'scale(1.4)';
      giftBtn.style.opacity = '0';
      setTimeout(() => giftBtn.remove(), 160);

      updateGameHUD();

      const target = Number(appState.targetGifts) || 6;
      if (giftsPopped >= target) {
        revealMasterGiftBox();
      }
    };

    giftBtn.addEventListener('pointerdown', handleTap);
    giftBtn.addEventListener('click', handleTap);
    layer.appendChild(giftBtn);

    setTimeout(() => {
      if (!popped && giftBtn.parentNode) {
        giftBtn.style.opacity = '0';
        giftBtn.style.transform = 'scale(0.5)';
        setTimeout(() => {
          if (giftBtn.parentNode) giftBtn.remove();
        }, 200);
      }
    }, 3400);
  }

  function startRhythmGame() {
    const total = Number(appState.targetGifts) || 6;
    giftsPopped = 0;
    gameCombo = 0;
    gameScore = 0;
    gameActive = true;
    updateGameHUD();

    document.getElementById('gameStartOverlay').classList.add('hidden');
    document.getElementById('masterGiftOverlay').classList.add('hidden');
    document.getElementById('masterGiftOverlay').classList.remove('flex');
    document.getElementById('masterOpenedCard').classList.add('hidden');
    document.getElementById('giftSpawnLayer').innerHTML = '';

    window.AudioEngine2010.startMusic(appState);

    spawnRhythmGiftBox();
    clearInterval(spawnTimer);
    const speed = Number(appState.beatSpeedMs) || 1050;
    spawnTimer = setInterval(() => {
      if (!gameActive || giftsPopped >= total) {
        clearInterval(spawnTimer);
        return;
      }
      spawnRhythmGiftBox();
    }, speed);
  }

  function revealMasterGiftBox() {
    gameActive = false;
    clearInterval(spawnTimer);
    document.getElementById('giftSpawnLayer').innerHTML = '';
    document.getElementById('gameStartOverlay').classList.add('hidden');
    document.getElementById('masterOpenedCard').classList.add('hidden');

    const masterOverlay = document.getElementById('masterGiftOverlay');
    masterOverlay.classList.remove('hidden');
    masterOverlay.classList.add('flex');

    window.AudioEngine2010.playFanfareSfx();
    if (typeof window.confetti === 'function') {
      window.confetti({
        particleCount: 65,
        spread: 88,
        origin: { y: 0.6 }
      });
    }
  }

  function openMasterGiftFinale() {
    window.AudioEngine2010.playFanfareSfx();
    const masterOverlay = document.getElementById('masterGiftOverlay');
    masterOverlay.classList.add('hidden');
    masterOverlay.classList.remove('flex');

    const openedCard = document.getElementById('masterOpenedCard');
    openedCard.classList.remove('hidden');

    if (typeof window.confetti === 'function') {
      const end = Date.now() + 1800;
      (function frame() {
        window.confetti({
          particleCount: 7,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.65 },
          colors: ['#F43F5E', '#FBBF24', '#EC4899']
        });
        window.confetti({
          particleCount: 7,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.65 },
          colors: ['#F43F5E', '#FBBF24', '#EC4899']
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }

    setTimeout(() => {
      const scene2 = document.getElementById('scene-2');
      if (scene2) {
        scene2.scrollIntoView({ behavior: 'smooth' });
        setActiveNavPill(2);
      }
    }, 1500);
  }

  // =========================================================================
  // SCENE 2: INTERACTIVE STORY BOARD (CHUYẾN TÀU KỶ NIỆM CỦA 3 BẠN NỮ)
  // =========================================================================
  let currentStoryIdx = 0;
  let highestUnlockedStoryIdx = 0;
  let isStoryCardFlipped = false;

  function updateStoryNavigation() {
    const prev = document.getElementById('btnStoryPrev');
    const next = document.getElementById('btnStoryNext');
    if (prev) prev.disabled = currentStoryIdx === 0;
    if (next) {
      const locked = currentStoryIdx >= highestUnlockedStoryIdx;
      next.setAttribute('aria-disabled', String(locked));
      next.classList.toggle('opacity-50', locked);
      next.classList.toggle('cursor-not-allowed', locked);
    }
  }

  function renderStoryStationTimeline() {
    const timeline = document.getElementById('trainStationTimeline');
    if (!timeline) return;
    timeline.innerHTML = '';

    appState.stories.forEach((st, idx) => {
      const isActive = idx === currentStoryIdx;
      const isLocked = idx > highestUnlockedStoryIdx;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-disabled', String(isLocked));
      btn.setAttribute('aria-current', isActive ? 'step' : 'false');
      btn.setAttribute('aria-label', isLocked ? `Trạm ${idx + 1}, đang khóa` : st.station);
      btn.className = isActive
        ? 'px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 flex-shrink-0 transition-all scale-105'
        : isLocked
          ? 'px-3 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 flex-shrink-0 cursor-not-allowed'
          : 'px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold border border-rose-200/80 flex items-center gap-1.5 flex-shrink-0 transition-all';
      btn.innerHTML = isLocked
        ? `<span aria-hidden="true">🔒</span><span>Trạm ${idx + 1}</span>`
        : `<span>${st.icon || '🌸'}</span><span>${escapeHtml(st.station)}</span>`;
      btn.addEventListener('click', () => {
        if (isLocked) {
          showToast('Đọc thư ở trạm hiện tại rồi lật lại để mở trạm tiếp theo.');
          return;
        }
          window.AudioEngine2010.playPopSfx(1.05);
          goToStoryCard(idx);
      });
      timeline.appendChild(btn);
    });
  }

  function renderActiveStoryCard() {
    if (!appState.stories.length) return;
    if (currentStoryIdx >= appState.stories.length) currentStoryIdx = 0;
    if (currentStoryIdx < 0) currentStoryIdx = appState.stories.length - 1;

    const st = appState.stories[currentStoryIdx];
    const inner = document.getElementById('storyCardInner');
    isStoryCardFlipped = false;
    if (inner) {
      inner.classList.remove('rotate-y-180');
      inner.style.transform = '';
    }

    document.getElementById('storyCardIndexBadge').textContent = `Trạm ${currentStoryIdx + 1} / ${appState.stories.length}`;
    document.getElementById('storyFrontImg').src = st.image || window.ASSETS_20_10.BOUQUET;
    document.getElementById('storyFrontIcon').textContent = st.icon || '🌸';
    document.getElementById('storyFrontStation').textContent = st.station;
    document.getElementById('storyFrontDate').textContent = st.date;
    document.getElementById('storyFrontTag').textContent = st.tag;
    document.getElementById('storyFrontTitle').textContent = st.title;
    document.getElementById('storyFrontQuote').textContent = `"${st.quote}"`;
    document.getElementById('storyLikeCount').textContent = st.likes || 520;

    document.getElementById('storyBackHeader').textContent = st.title;
    document.getElementById('storyBackLetter').textContent = st.letter;
    document.getElementById('storyBackSignature').textContent = st.signature || '— Tập Thể Lớp Mình —';

    renderStoryStationTimeline();
    updateStoryNavigation();
  }

  function goToStoryCard(newIdx) {
    if (!appState.stories.length) return;
    if (newIdx < 0) newIdx = 0;
    if (newIdx >= appState.stories.length) newIdx = appState.stories.length - 1;
    if (newIdx > highestUnlockedStoryIdx) {
      showToast('Hãy lật thiệp và đọc thư để mở trạm tiếp theo nhé!');
      const inner = document.getElementById('storyCardInner');
      if (inner) inner.style.transform = `rotateY(${isStoryCardFlipped ? 180 : 0}deg)`;
      return;
    }
    currentStoryIdx = newIdx;
    renderActiveStoryCard();
  }

  function flipStoryCard(forceState) {
    const inner = document.getElementById('storyCardInner');
    if (!inner) return;
    const wasFlipped = isStoryCardFlipped;
    isStoryCardFlipped = typeof forceState === 'boolean' ? forceState : !isStoryCardFlipped;
    window.AudioEngine2010.playPopSfx(1.15);
    if (isStoryCardFlipped) {
      inner.style.transform = 'rotateY(180deg)';
    } else {
      inner.style.transform = 'rotateY(0deg)';
      if (wasFlipped && currentStoryIdx === highestUnlockedStoryIdx && highestUnlockedStoryIdx < appState.stories.length - 1) {
        highestUnlockedStoryIdx += 1;
        renderStoryStationTimeline();
        showToast('Đã đọc xong trạm này. Trạm tiếp theo đã mở!');
      }
    }
    updateStoryNavigation();
  }

  function initStoryCardDragSwipe() {
    const stage = document.getElementById('storyDragStage');
    const inner = document.getElementById('storyCardInner');
    if (!stage || !inner) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    stage.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      isDragging = true;
      startX = e.clientX;
      currentX = 0;
      inner.style.transition = 'none';
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      currentX = e.clientX - startX;
      const rotateZ = currentX * 0.04;
      const baseRotateY = isStoryCardFlipped ? 180 : 0;
      inner.style.transform = `translateX(${currentX}px) rotateZ(${rotateZ}deg) rotateY(${baseRotateY + currentX * 0.05}deg)`;
    });

    window.addEventListener('pointerup', () => {
      if (!isDragging) return;
      isDragging = false;
      inner.style.transition = 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)';

      if (currentX < -75) {
        window.AudioEngine2010.playPopSfx(1.1);
        goToStoryCard(currentStoryIdx + 1);
      } else if (currentX > 75) {
        window.AudioEngine2010.playPopSfx(0.95);
        goToStoryCard(currentStoryIdx - 1);
      } else {
        const baseRotateY = isStoryCardFlipped ? 180 : 0;
        inner.style.transform = `rotateY(${baseRotateY}deg)`;
      }
      currentX = 0;
    });
  }

  // =========================================================================
  // SCENE 3: INTERACTIVE PHOTO GALLERY & NHÂN VẬT NỮ VŨ CÔNG 3D WEBGL
  // =========================================================================
  let currentGalleryIdx = 0;
  let galleryAutoTimer = null;

  function renderGallery() {
    const list = appState.gallery;
    if (!list.length) return;
    if (currentGalleryIdx >= list.length) currentGalleryIdx = 0;
    if (currentGalleryIdx < 0) currentGalleryIdx = list.length - 1;

    const activeItem = list[currentGalleryIdx];
    const nextItem = list[(currentGalleryIdx + 1) % list.length];

    document.getElementById('galleryCounterBadge').textContent = `${currentGalleryIdx + 1} / ${list.length}`;
    document.getElementById('galleryActiveImg').src = activeItem.image;
    document.getElementById('galleryActiveTag').textContent = activeItem.tag || `Khoảnh Khắc #${currentGalleryIdx + 1}`;
    document.getElementById('galleryActiveTitle').textContent = activeItem.title;
    document.getElementById('galleryActiveDesc').textContent = activeItem.desc;
    document.getElementById('galleryBackImg').src = nextItem.image;

    const thumbs = document.getElementById('galleryThumbsContainer');
    if (thumbs) {
      thumbs.innerHTML = '';
      list.forEach((item, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = idx === currentGalleryIdx
          ? 'w-12 h-12 rounded-xl overflow-hidden border-2 border-rose-600 scale-105 shadow-md flex-shrink-0 transition'
          : 'w-11 h-11 rounded-xl overflow-hidden border border-rose-200 opacity-65 hover:opacity-100 flex-shrink-0 transition';
        btn.innerHTML = `<img src="${item.image}" alt="" class="w-full h-full object-cover pointer-events-none" />`;
        btn.addEventListener('click', () => {
          window.AudioEngine2010.playPopSfx(1.1);
          currentGalleryIdx = idx;
          renderGallery();
        });
        thumbs.appendChild(btn);
      });
    }
  }

  function stepGallery(delta) {
    if (!appState.gallery.length) return;
    const card = document.getElementById('galleryActiveCard');
    if (card) {
      card.style.transform = `translateX(${delta > 0 ? '-24px' : '24px'}) scale(0.96)`;
      setTimeout(() => {
        card.style.transform = 'translateX(0) scale(1)';
      }, 180);
    }
    currentGalleryIdx = (currentGalleryIdx + delta + appState.gallery.length) % appState.gallery.length;
    window.AudioEngine2010.playPopSfx(1.08);
    renderGallery();
  }

  function initGallerySwipe() {
    const area = document.getElementById('gallerySwipeArea');
    const card = document.getElementById('galleryActiveCard');
    if (!area || !card) return;

    let startX = 0;
    let deltaX = 0;
    let dragging = false;

    area.addEventListener('pointerdown', (e) => {
      dragging = true;
      startX = e.clientX;
      deltaX = 0;
      card.style.transition = 'none';
    });

    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      deltaX = e.clientX - startX;
      card.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.035}deg)`;
    });

    window.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      card.style.transition = 'transform 0.35s ease-out';
      if (deltaX < -60) {
        stepGallery(1);
      } else if (deltaX > 60) {
        stepGallery(-1);
      } else {
        card.style.transform = 'translateX(0) rotate(0deg)';
      }
      deltaX = 0;
    });
  }

  let mascotQuoteIdx = 0;
  let mascotHearts = [];

  function initMascotCanvasAndInteractions() {
    const canvas = document.getElementById('mascotFxCanvas');
    const stageBox = document.getElementById('mascotStageBox');
    if (!canvas || !stageBox) return;
    const ctx = canvas.getContext('2d');

    function resizeMascotCanvas() {
      canvas.width = stageBox.clientWidth || 320;
      canvas.height = stageBox.clientHeight || 340;
    }
    resizeMascotCanvas();
    window.addEventListener('resize', resizeMascotCanvas);

    // Khởi tạo mô hình Nữ Vũ Công Idol 3D WebGL bằng Three.js
    if (window.Mascot3DEngine) {
      window.Mascot3DEngine.init3DMascot('mascotWebGLMount');
    }

    setInterval(() => {
      if (mascotHearts.length < 16) {
        mascotHearts.push({
          x: canvas.width * (0.18 + Math.random() * 0.64),
          y: canvas.height * 0.78,
          vy: 0.8 + Math.random() * 1.2,
          vx: (Math.random() - 0.5) * 1.1,
          size: 12 + Math.random() * 10,
          alpha: 0.95,
          symbol: Math.random() > 0.35 ? '💖' : (Math.random() > 0.5 ? '🌸' : '✨')
        });
      }
    }, 550);

    function animateMascotFx() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = mascotHearts.length - 1; i >= 0; i--) {
        const h = mascotHearts[i];
        h.y -= h.vy;
        h.x += h.vx;
        h.alpha -= 0.008;
        if (h.alpha <= 0 || h.y < -20) {
          mascotHearts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, h.alpha);
        ctx.font = `${Math.round(h.size)}px sans-serif`;
        ctx.fillText(h.symbol, h.x, h.y);
        ctx.restore();
      }
      requestAnimationFrame(animateMascotFx);
    }
    animateMascotFx();

    stageBox.addEventListener('click', () => {
      window.AudioEngine2010.playPopSfx(1.25);
      if (window.Mascot3DEngine) {
        window.Mascot3DEngine.triggerJumpBoost();
      }
      const quotes = appState.mascotQuotes || DEFAULT_STATE.mascotQuotes;
      mascotQuoteIdx = (mascotQuoteIdx + 1) % quotes.length;
      const bubble = document.getElementById('mascotSpeechBubble');
      if (bubble) {
        bubble.textContent = quotes[mascotQuoteIdx];
        bubble.style.transform = 'scale(1.08)';
        setTimeout(() => { bubble.style.transform = 'scale(1)'; }, 200);
      }
      for (let i = 0; i < 10; i++) {
        mascotHearts.push({
          x: canvas.width * 0.5 + (Math.random() - 0.5) * 60,
          y: canvas.height * 0.55,
          vy: 1.5 + Math.random() * 2.2,
          vx: (Math.random() - 0.5) * 3.2,
          size: 16 + Math.random() * 12,
          alpha: 1,
          symbol: ['💖', '🌸', '✨', '🌷'][i % 4]
        });
      }
    });
  }

  function renderMascotDisplay() {
    const webglMount = document.getElementById('mascotWebGLMount');
    const defaultWrap = document.getElementById('mascotDefaultWrapper');
    const defaultImg = document.getElementById('mascotDefaultImg');
    if (defaultImg && window.ASSETS_20_10.MASCOT_BUNNY) {
      defaultImg.src = window.ASSETS_20_10.MASCOT_BUNNY;
    }

    if (appState.customMascotType === 'orig2d') {
      if (webglMount) webglMount.classList.add('hidden');
      if (defaultWrap) defaultWrap.classList.remove('hidden');
    } else {
      if (webglMount) webglMount.classList.remove('hidden');
      if (defaultWrap) defaultWrap.classList.add('hidden');
    }
  }

  // =========================================================================
  // =========================================================================
  function renderWishWall() {
    const grid = document.getElementById('wishWallGrid');
    if (!grid) return;
    grid.innerHTML = '';
    appState.wishesWall.forEach((w) => {
      const card = document.createElement('div');
      card.className = 'p-4 sm:p-5 rounded-2xl bg-white/92 border border-rose-200/85 shadow-sm flex flex-col justify-between hover:shadow-md transition';
      const recipientTag = w.recipient ? `<span class="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">Gửi: ${escapeHtml(w.recipient)}</span>` : '';
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <div class="flex items-center gap-2.5">
              <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 border border-rose-200 flex items-center justify-center text-lg shadow-sm">${w.emoji || '🌸'}</span>
              <div>
                <span class="font-bold text-xs sm:text-sm text-rose-950 block">${escapeHtml(w.sender)}</span>
                ${recipientTag}
              </div>
            </div>
            <span class="text-[10px] text-rose-400 font-semibold">${escapeHtml(w.time || '20/10')}</span>
          </div>
          <p class="text-xs sm:text-sm text-rose-800/90 leading-relaxed mt-1">${escapeHtml(w.content)}</p>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // =========================================================================
  // =========================================================================
  function setActiveNavPill(sceneNumber) {
    document.querySelectorAll('.scene-nav-btn').forEach((btn) => {
      const num = Number(btn.getAttribute('data-scene-nav'));
      if (num === sceneNumber) {
        btn.className = 'scene-nav-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-white text-rose-600 shadow-sm flex items-center gap-1.5';
      } else {
        btn.className = 'scene-nav-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-rose-800/80 hover:text-rose-600 flex items-center gap-1.5';
      }
    });
    document.querySelectorAll('.scene-nav-btn-mobile').forEach((btn) => {
      const num = Number(btn.getAttribute('data-scene-nav'));
      if (num === sceneNumber) {
        btn.className = 'scene-nav-btn-mobile px-2 py-1 rounded-lg text-xs font-bold bg-white text-rose-600 shadow-sm';
      } else {
        btn.className = 'scene-nav-btn-mobile px-2 py-1 rounded-lg text-xs font-bold text-rose-700';
      }
    });
  }

  function applyGeneralBranding() {
    document.getElementById('navBrandTitle').textContent = appState.brandTitle;
    document.getElementById('navRecipientSub').textContent = appState.recipientSub;
    const tb = document.getElementById('trainBannerStaticImg');
    if (tb) tb.src = window.ASSETS_20_10.TRAIN;
  }

  // =========================================================================
  // KHỞI CHẠY ỨNG DỤNG KHI DOM SẴN SÀNG
  // =========================================================================
  window.startEcardApp = function () {
    applyGeneralBranding();
    initAmbientPetals();
    renderClassmateSelector();
    selectClassmateProfile('all', false);
    updateGameHUD();
    window.AudioEngine2010.updateUI(appState);
    renderActiveStoryCard();
    initStoryCardDragSwipe();
    renderGallery();
    initGallerySwipe();
    initMascotCanvasAndInteractions();
    renderMascotDisplay();
    renderWishWall();
    window._ecardReady = true;
    window.dispatchEvent(new Event('ecard:ready'));

    // Điều hướng chuyển cảnh
    document.querySelectorAll('[data-scene-nav]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const num = Number(btn.getAttribute('data-scene-nav'));
        setActiveNavPill(num);
        const target = document.getElementById(`scene-${num}`);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    document.querySelectorAll('[data-scroll-to]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const id = el.getAttribute('data-scroll-to');
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.4;
      const s2 = document.getElementById('scene-2');
      const s3 = document.getElementById('scene-3');
      if (s3 && scrollPos >= s3.offsetTop) {
        setActiveNavPill(3);
      } else if (s2 && scrollPos >= s2.offsetTop) {
        setActiveNavPill(2);
      } else {
        setActiveNavPill(1);
      }
    }, { passive: true });

    // Điều khiển Nhạc nền & SFX
    document.getElementById('btnToggleMusic').addEventListener('click', () => {
      window.AudioEngine2010.toggleMusic(appState);
      const playing = window.AudioEngine2010.isPlaying();
      const button = document.getElementById('btnToggleMusic');
      button.setAttribute('aria-pressed', String(playing));
      button.title = playing ? 'Tạm dừng nhạc nền' : 'Phát nhạc nền';
      showToast(playing ? 'Đang phát nhạc nền' : 'Đã tạm dừng nhạc nền');
    });
    document.getElementById('btnToggleSfx').addEventListener('click', (e) => {
      const muted = window.AudioEngine2010.toggleSfx();
      e.currentTarget.setAttribute('aria-pressed', String(muted));
      e.currentTarget.title = muted ? 'Bật âm thanh hiệu ứng' : 'Tắt âm thanh hiệu ứng';
      e.currentTarget.textContent = muted ? '🔇' : '🔊';
      showToast(muted ? 'Đã tắt âm thanh hiệu ứng (SFX)' : 'Đã bật âm thanh hiệu ứng (SFX)');
    });

    // Giao diện 1: Rhythm Game
    document.getElementById('btnStartRhythmGame').addEventListener('click', startRhythmGame);
    document.getElementById('btnInstantMaster').addEventListener('click', () => {
      giftsPopped = Number(appState.targetGifts) || 6;
      updateGameHUD();
      revealMasterGiftBox();
    });
    document.getElementById('btnOpenMasterGift').addEventListener('click', openMasterGiftFinale);
    document.getElementById('btnGoScene2Now').addEventListener('click', () => {
      document.getElementById('scene-2').scrollIntoView({ behavior: 'smooth' });
      setActiveNavPill(2);
    });
    document.getElementById('btnReplayGame').addEventListener('click', startRhythmGame);

    // Giao diện 2: Chuyến Tàu Kỷ Niệm
    document.getElementById('btnFlipToBack').addEventListener('click', () => flipStoryCard(true));
    document.getElementById('btnFlipToFront').addEventListener('click', () => flipStoryCard(false));
    document.getElementById('btnStoryPrev').addEventListener('click', () => {
      window.AudioEngine2010.playPopSfx(0.95);
      goToStoryCard(currentStoryIdx - 1);
    });
    document.getElementById('btnStoryNext').addEventListener('click', () => {
      window.AudioEngine2010.playPopSfx(1.1);
      goToStoryCard(currentStoryIdx + 1);
    });
    document.getElementById('btnHeartStory').addEventListener('click', () => {
      const st = appState.stories[currentStoryIdx];
      if (st) {
        st.likes = (st.likes || 520) + 1;
        document.getElementById('storyLikeCount').textContent = st.likes;
        window.AudioEngine2010.playPopSfx(1.3);
      }
    });
    document.getElementById('btnStoryConfetti').addEventListener('click', (e) => {
      window.AudioEngine2010.playFanfareSfx();
      fireConfettiAtElement(e.currentTarget);
    });

    // Giao diện 3: Gallery & Nữ Vũ Công 3D
    document.getElementById('btnGalleryPrev').addEventListener('click', () => stepGallery(-1));
    document.getElementById('btnGalleryNext').addEventListener('click', () => stepGallery(1));
    document.getElementById('btnToggleGalleryAuto').addEventListener('click', (e) => {
      if (galleryAutoTimer) {
        clearInterval(galleryAutoTimer);
        galleryAutoTimer = null;
        e.currentTarget.classList.remove('bg-rose-600', 'text-white');
        e.currentTarget.classList.add('bg-rose-50', 'text-rose-700');
        showToast('Đã dừng tự động chuyển ảnh');
      } else {
        galleryAutoTimer = setInterval(() => stepGallery(1), 2800);
        e.currentTarget.classList.remove('bg-rose-50', 'text-rose-700');
        e.currentTarget.classList.add('bg-rose-600', 'text-white');
        showToast('Đang tự động trình chiếu bộ sưu tập ảnh 📸');
      }
    });

    // Chuyển đổi giữa Thỏ 3D Mini WebGL, Chibi Mini 3D WebGL và Bản Gốc Lúc Đầu
    const btnBunny = document.getElementById('btnMiniBunny3D');
    const btnChibi = document.getElementById('btnMiniChibi3D');
    const btnOrig = document.getElementById('btnMiniOrig');
    function setMiniTabStyle(activeBtn) {
      [btnBunny, btnChibi, btnOrig].forEach((b) => {
        if (!b) return;
        b.className = (b === activeBtn)
          ? 'px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold shadow-sm transition'
          : 'px-2 py-1 rounded-lg bg-rose-50 text-rose-700 text-[10px] font-semibold transition';
      });
    }
    if (btnBunny) {
      btnBunny.addEventListener('click', () => {
        appState.customMascotType = 'webgl3d';
        if (window.Mascot3DEngine) window.Mascot3DEngine.setCharacterStyle('bunny');
        renderMascotDisplay();
        setMiniTabStyle(btnBunny);
        window.AudioEngine2010.playPopSfx(1.15);
      });
    }
    if (btnChibi) {
      btnChibi.addEventListener('click', () => {
        appState.customMascotType = 'webgl3d';
        if (window.Mascot3DEngine) window.Mascot3DEngine.setCharacterStyle('chibi');
        renderMascotDisplay();
        setMiniTabStyle(btnChibi);
        window.AudioEngine2010.playPopSfx(1.2);
      });
    }
    if (btnOrig) {
      btnOrig.addEventListener('click', () => {
        appState.customMascotType = 'orig2d';
        renderMascotDisplay();
        setMiniTabStyle(btnOrig);
        window.AudioEngine2010.playPopSfx(1.1);
      });
    }

    // 4 Nút đổi Vũ Điệu 3D cho Linh Vật 3D Mini
    document.querySelectorAll('.dance-mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-dance-mode');
        if (window.Mascot3DEngine) {
          window.Mascot3DEngine.setDanceMode(mode);
        }
        const wrap = document.getElementById('mascotDefaultWrapper');
        if (wrap) {
          wrap.className = `${wrap.classList.contains('hidden') ? 'hidden ' : ''}relative z-10 w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center mascot-mode-${mode} transition-all`;
        }
        document.querySelectorAll('.dance-mode-btn').forEach((b) => {
          b.className = 'dance-mode-btn py-2 px-2 rounded-xl text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition';
        });
        btn.className = 'dance-mode-btn py-2 px-2 rounded-xl text-[11px] font-bold bg-rose-600 text-white shadow-sm transition';
        window.AudioEngine2010.playPopSfx(1.2);
      });
    });

    document.getElementById('btnGrandFinaleFireworks').addEventListener('click', () => {
      window.AudioEngine2010.playFanfareSfx();
      if (window.Mascot3DEngine) {
        window.Mascot3DEngine.triggerJumpBoost();
      }
      showToast('Chúc Nguyễn Anh Thư, Trần Thị Bảo Linh & Trần Thị Lương 20/10 rực rỡ nhất! 🌸💖');
      if (typeof window.confetti === 'function') {
        window.confetti({
          particleCount: 100,
          spread: 110,
          origin: { y: 0.65 }
        });
      }
    });

  };

  window.setEcardPreviewData = function (payload) {
    if (!payload || !payload.data) return;
    if (payload.assets) window.ASSETS_20_10 = payload.assets;
    if (payload.profiles) {
      window.CLASSMATES_PROFILES = payload.profiles;
      CLASSMATES = payload.profiles;
    }
    appState = payload.data;
    activeClassmateKey = 'all';
    currentStoryIdx = 0;
    highestUnlockedStoryIdx = 0;
    currentGalleryIdx = 0;
    applyGeneralBranding();
    renderClassmateSelector();
    selectClassmateProfile('all');
    updateGameHUD();
    window.AudioEngine2010.updateUI(appState);
    renderActiveStoryCard();
    renderGallery();
    renderMascotDisplay();
    renderWishWall();
    window.dispatchEvent(new Event('ecard:preview-updated'));
  };
})();
