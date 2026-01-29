(function() {
  // ---------- Helpers ----------
  const $ = (id) => document.getElementById(id);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const fmt2 = (n) => String(n).padStart(2, '0');

  const formatMs = (ms) => {
    const total = Math.max(0, Math.floor(ms));
    const m = Math.floor(total / 60000);
    const s = Math.floor((total % 60000) / 1000);
    const cs = Math.floor((total % 1000) / 10);
    return `${fmt2(m)}:${fmt2(s)}.${fmt2(cs)}`;
  };

  // Main display (large text)
  const formatDisplay = (ms) => {
    const t = formatMs(ms);
    const [mmss, cs] = t.split('.');
    return `${mmss}<span class="ms">.${cs}</span>`;
  };

  // List display (small blue ms)
  const formatListDisplay = (ms) => {
    const t = formatMs(ms);
    const [mmss, cs] = t.split('.');
    return `${mmss}<span class="ms-small">.${cs}</span>`;
  };

  // Badge display (small blue ms for badges)
  const formatBadgeDisplay = (ms) => {
    const t = formatMs(ms);
    const [mmss, cs] = t.split('.');
    return `${mmss}<span class="ms-badge">.${cs}</span>`;
  };

  const toastEl = $('toast');
  let toastT = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), 1600);
  }

  // Audio & Haptic
  let audioCtx = null;
  function bip() {
    if (!settings.sound) return;
    try {
      audioCtx = audioCtx || new(window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.value = 0.04;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      o.stop(audioCtx.currentTime + 0.08);
    } catch (e) {}
  }

  function vibrate(ms) {
    if (!settings.vibration) return;
    try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {}
  }

  // Wake Lock
  let wakeLock = null;
  async function setWakeLock(on) {
    if (!('wakeLock' in navigator)) return;
    try {
      if (on && !wakeLock) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      }
      if (!on && wakeLock) {
        await wakeLock.release();
        wakeLock = null;
      }
    } catch (e) {}
  }

  // ---------- DOM Elements ----------
  const display = $('display');
  const phaseLabel = $('phaseLabel');
  const startStopBtn = $('startStopBtn');
  const resetBtn = $('resetBtn');
  const lapBtn = $('lapBtn');
  const lapsList = $('lapsList');
  const lapCountLabel = $('lapCount');
  const lapsTitle = $('lapsTitle');
  
  const tabStopwatch = $('tabStopwatch');
  const tabInterval = $('tabInterval');
  const settingsBtn = $('settingsBtn');

  const dlg = $('settingsDialog');
  const closeSettings = $('closeSettings');
  const saveSettings = $('saveSettings');
  const copyExport = $('copyExport');

  const preset = $('preset');
  const roundsInput = $('rounds');
  const workInput = $('work');
  const restInput = $('rest');
  const vibrationToggle = $('vibration');
  const soundToggle = $('sound');
  const wakeToggle = $('wakelock');
  
  const navToggle = $('navToggle');
  const nav = $('primary-nav');
  const year = $('year');
  if(year) year.textContent = new Date().getFullYear();

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // ---------- State ----------
  const STORAGE_KEY = 'bg_chrono_v2';
  const defaults = {
    mode: 'stopwatch',
    vibration: true,
    sound: true,
    wake: false,
    interval: { preset: 'tabata', rounds: 8, work: 20, rest: 10 },
    laps: []
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(defaults);
      const parsed = JSON.parse(raw);
      return {
        ...structuredClone(defaults),
        ...parsed,
        interval: { ...defaults.interval, ...(parsed.interval || {}) }
      };
    } catch (e) { return structuredClone(defaults); }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        mode,
        vibration: settings.vibration,
        sound: settings.sound,
        wake: settings.wake,
        interval: settings.interval,
        laps
      }));
    } catch (e) {}
  }

  const initial = loadState();
  let mode = initial.mode;
  const settings = {
    vibration: !!initial.vibration,
    sound: !!initial.sound,
    wake: !!initial.wake,
    interval: {
      preset: initial.interval.preset || 'tabata',
      rounds: clamp(Number(initial.interval.rounds)||8, 1, 99),
      work: clamp(Number(initial.interval.work)||20, 5, 3600),
      rest: clamp(Number(initial.interval.rest)||10, 0, 3600)
    }
  };

  let swRunning = false;
  let swAccum = 0;
  let swStart = 0;
  let rafId = null;
  let laps = Array.isArray(initial.laps) ? initial.laps : [];

  // Interval State
  let intRunning = false;
  let intPhase = 'work';
  let intRound = 1;
  let intLeftMs = settings.interval.work * 1000;
  let intLastTick = 0;
  
  let intAccum = 0;
  if(mode === 'interval' && laps.length > 0) {
    intAccum = laps[0].totalMs;
  }

  // ---------- Visual Helpers ----------
  function updatePhaseVisuals() {
    display.classList.remove('text-work', 'text-rest');
    phaseLabel.classList.remove('text-work', 'text-rest', 'visible');
    
    if (mode === 'stopwatch') {
      phaseLabel.textContent = '';
      return;
    }

    phaseLabel.classList.add('visible');
    if (intPhase === 'work') {
      phaseLabel.textContent = 'ÇALIŞMA';
      phaseLabel.classList.add('text-work');
      display.classList.add('text-work');
    } else {
      phaseLabel.textContent = 'DİNLENME';
      phaseLabel.classList.add('text-rest');
      display.classList.add('text-rest');
    }
  }

  // ---------- Render Logic ----------
  function setTabs() {
    const sw = mode === 'stopwatch';
    tabStopwatch.setAttribute('aria-selected', sw ? 'true' : 'false');
    tabInterval.setAttribute('aria-selected', sw ? 'false' : 'true');

    lapsTitle.textContent = sw ? 'Turlar' : 'Aralıklar';
    lapBtn.textContent = sw ? 'TUR' : 'SONRAKİ';
    
    if(sw) {
      $('badgeLeft').innerHTML = `Toplam: <b id="totalLabel">${formatBadgeDisplay(currentTotalMs())}</b>`;
      $('badgeRight').innerHTML = `Tur: <b id="lapLabel">${formatBadgeDisplay(currentLapMs())}</b>`;
    } else {
      $('badgeLeft').innerHTML = `Tur: <b id="totalLabel">${intRound}/${settings.interval.rounds}</b>`;
      $('badgeRight').innerHTML = `${intPhase === 'work' ? 'Çalışma' : 'Dinlenme'}: <b id="lapLabel">${formatBadgeDisplay(intLeftMs)}</b>`;
    }

    lapBtn.disabled = sw ? !swRunning : !intRunning;

    if (!sw) {
      if (!intRunning && intLeftMs <= 0) {
        intLeftMs = settings.interval.work * 1000;
        intPhase = 'work';
        intRound = 1;
      }
    }

    updatePhaseVisuals();

    startStopBtn.textContent = isRunning() ? 'DURAKLAT' : 'BAŞLAT';
    display.innerHTML = sw ? formatDisplay(currentTotalMs()) : formatDisplay(intLeftMs);

    renderLaps();
    saveState();
  }

  function currentTotalMs() {
    if (!swRunning) return swAccum;
    return swAccum + (performance.now() - swStart);
  }

  function currentLapMs() {
    const total = currentTotalMs();
    const prevTotal = laps.length ? laps[0].totalMs : 0;
    return Math.max(0, total - prevTotal);
  }

  function isRunning() { return mode === 'stopwatch' ? swRunning : intRunning; }

  function setUIState() {
    const running = isRunning();
    startStopBtn.textContent = running ? 'DURAKLAT' : (mode === 'stopwatch' && swAccum > 0 ? 'DEVAM ET' : 'BAŞLAT');
    lapBtn.disabled = !running;
  }

  function renderLaps() {
    lapCountLabel.textContent = `${laps.length} Kayıt`;
    if (!laps.length) {
      lapsList.innerHTML = '<div style="padding:10px; color:rgba(156,163,175,.8); text-align:center; font-size:0.9rem;">Henüz kayıt yok.</div>';
      return;
    }
    
    let bestIdx = -1;
    if (mode === 'stopwatch') {
      let best = Infinity;
      laps.forEach((x, i) => { if (x.splitMs > 0 && x.splitMs < best) { best = x.splitMs; bestIdx = i; } });
    }

    const items = laps.map((x, i) => {
      const idx = laps.length - i;
      const bestClass = (mode === 'stopwatch' && i === bestIdx) ? 'best' : '';
      const leftLabel = mode === 'stopwatch' ? 'Split' : 'Süre';
      const rightLabel = mode === 'stopwatch' ? 'Toplam' : 'Toplam';
      
      return `
        <div class="lap-item ${bestClass}">
          <div class="lap-idx">#${idx}</div>
          <div class="lap-col">
            <div class="label">${leftLabel}</div>
            <div class="val">${formatListDisplay(x.splitMs)}</div>
          </div>
          <div class="lap-col">
            <div class="label">${rightLabel}</div>
            <div class="val">${formatListDisplay(x.totalMs)}</div>
          </div>
        </div>
      `;
    }).join('');
    lapsList.innerHTML = items;
  }

  // ---------- Loops ----------
  function updateStopwatchFrame() {
    if (!swRunning) return;
    const total = currentTotalMs();
    display.innerHTML = formatDisplay(total);
    
    const tLabel = $('totalLabel');
    const lLabel = $('lapLabel');
    if(tLabel) tLabel.innerHTML = formatBadgeDisplay(total);
    if(lLabel) lLabel.innerHTML = formatBadgeDisplay(currentLapMs());

    rafId = requestAnimationFrame(updateStopwatchFrame);
  }

  function updateIntervalFrame(now) {
    if (!intRunning) return;
    if (!intLastTick) intLastTick = now;
    const dt = now - intLastTick;
    intLastTick = now;
    intLeftMs = Math.max(0, intLeftMs - dt);

    display.innerHTML = formatDisplay(intLeftMs);
    const lLabel = $('lapLabel');
    if(lLabel) lLabel.innerHTML = formatBadgeDisplay(intLeftMs);

    if (intLeftMs <= 0) {
      // Phase Done
      const phaseDur = (intPhase === 'work' ? settings.interval.work : settings.interval.rest) * 1000;
      
      intAccum += phaseDur;
      laps.unshift({ totalMs: intAccum, splitMs: phaseDur });
      renderLaps();
      vibrate(50); bip();

      if (intPhase === 'work') {
        if (settings.interval.rest > 0) {
          intPhase = 'rest';
          intLeftMs = settings.interval.rest * 1000;
        } else {
          nextRoundOrFinish();
        }
      } else {
        nextRoundOrFinish();
      }
      setTabs(); // refreshes labels and visuals
      setUIState();
      toast(`${intPhase === 'work' ? 'Çalışma' : 'Dinlenme'} Başladı`);
    }
    rafId = requestAnimationFrame(updateIntervalFrame);
  }

  function nextRoundOrFinish() {
    if (intRound >= settings.interval.rounds) {
      stopInterval(true);
    } else {
      intRound++;
      intPhase = 'work';
      intLeftMs = settings.interval.work * 1000;
    }
  }

  // ---------- Controls ----------
  async function toggleTimer() {
    if (mode === 'stopwatch') {
      if (swRunning) {
        swAccum = currentTotalMs();
        swRunning = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        setUIState();
        await setWakeLock(false);
        saveState();
        vibrate(10);
        return;
      }
      swStart = performance.now();
      swRunning = true;
      setUIState();
      if (settings.wake) await setWakeLock(true);
      rafId = requestAnimationFrame(updateStopwatchFrame);
      saveState();
      vibrate(15);
      return;
    }
    // Interval
    if (intRunning) {
      intRunning = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      setUIState();
      await setWakeLock(false);
      saveState();
      vibrate(10);
      return;
    }
    intRunning = true;
    intLastTick = 0;
    setUIState();
    if (settings.wake) await setWakeLock(true);
    rafId = requestAnimationFrame(updateIntervalFrame);
    saveState();
    vibrate(15);
  }

  function recordLap() {
    if (mode === 'stopwatch') {
      if (!swRunning) return;
      const total = currentTotalMs();
      const prev = laps.length ? laps[0].totalMs : 0;
      const split = Math.max(0, total - prev);
      laps.unshift({ totalMs: total, splitMs: split });
      renderLaps();
      vibrate(12);
      saveState();
      return;
    }
    // Interval skip
    if (!intRunning) return;
    intLeftMs = 0; // Trigger next phase immediately
  }

  async function resetAll() {
    if (isRunning()) { toast('Önce duraklat'); return; }
    
    swRunning = false; 
    swAccum = 0;
    if (rafId) cancelAnimationFrame(rafId);
    
    intRunning = false; 
    intPhase = 'work'; 
    intRound = 1; 
    intLeftMs = settings.interval.work * 1000;
    intAccum = 0;
    
    laps = [];
    
    display.innerHTML = mode === 'stopwatch' ? formatDisplay(0) : formatDisplay(intLeftMs);
    renderLaps();
    setTabs(); // resets badges and visuals
    setUIState();
    await setWakeLock(false);
    saveState();
    vibrate(20);
    toast('Sıfırlandı');
  }

  async function stopInterval(finished) {
    intRunning = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    await setWakeLock(false);
    setUIState();
    saveState();
    toast(finished ? 'Antrenman Bitti! 🔥' : 'Duraklatıldı');
    vibrate(finished ? 80 : 10);
  }

  // ---------- Settings Modal ----------
  function openSettings() {
    preset.value = settings.interval.preset;
    roundsInput.value = settings.interval.rounds;
    workInput.value = settings.interval.work;
    restInput.value = settings.interval.rest;
    vibrationToggle.checked = settings.vibration;
    soundToggle.checked = settings.sound;
    wakeToggle.checked = settings.wake;
    try { dlg.showModal(); } catch(e) { dlg.setAttribute('open',''); }
  }

  function applyPreset(p) {
    if (p === 'tabata') return { rounds:8, work:20, rest:10 };
    if (p === 'hiit') return { rounds:10, work:40, rest:20 };
    if (p === 'boxing') return { rounds:6, work:180, rest:60 };
    return null;
  }

  async function saveSettingsFn() {
    // Show visual feedback immediately
    const btn = $('saveSettings');
    const originalText = btn.textContent;
    const originalBg = btn.style.backgroundColor;
    const originalColor = btn.style.color;
    
    btn.textContent = 'KAYDEDİLDİ!';
    btn.style.backgroundColor = '#22c55e'; // Success Green
    btn.style.color = '#ffffff';

    const p = preset.value;
    const pre = applyPreset(p);
    const rounds = clamp(Number(roundsInput.value)||8, 1, 99);
    const work = clamp(Number(workInput.value)||20, 5, 3600);
    const rest = clamp(Number(restInput.value)||10, 0, 3600);
    
    settings.interval.preset = p;
    // CRITICAL FIX: If user manually edited, preset is 'custom', so pre is null.
    // If pre is null, use the manual inputs.
    // If pre exists (user picked dropdown), use preset defaults.
    settings.interval.rounds = pre ? pre.rounds : rounds;
    settings.interval.work = pre ? pre.work : work;
    settings.interval.rest = pre ? pre.rest : rest;
    
    settings.vibration = !!vibrationToggle.checked;
    settings.sound = !!soundToggle.checked;
    settings.wake = !!wakeToggle.checked;

    // Apply settings if interval is not running
    if (mode === 'interval' && !intRunning) {
      intPhase = 'work'; intRound = 1;
      intLeftMs = settings.interval.work * 1000;
      intAccum = 0;
      display.innerHTML = formatDisplay(intLeftMs);
      updatePhaseVisuals();
    }
    
    await setWakeLock(settings.wake && isRunning());
    saveState();

    // Close dialog after short delay to show success
    setTimeout(() => {
        try { dlg.close(); } catch(e) { dlg.removeAttribute('open'); }
        
        // Reset button for next time
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = originalBg;
            btn.style.color = originalColor;
        }, 300);
    }, 500);
  }

  function setMode(next) {
    if(isRunning()) { toast('Önce duraklat'); return; }
    mode = next;
    saveState();
    setTabs();
    setUIState();
    toast(next === 'stopwatch' ? 'Kronometre' : 'Interval');
  }

  // Listeners
  startStopBtn.addEventListener('click', toggleTimer);
  resetBtn.addEventListener('click', resetAll);
  lapBtn.addEventListener('click', recordLap);
  tabStopwatch.addEventListener('click', () => setMode('stopwatch'));
  tabInterval.addEventListener('click', () => setMode('interval'));
  settingsBtn.addEventListener('click', openSettings);
  closeSettings.addEventListener('click', () => { try{dlg.close();}catch(e){dlg.removeAttribute('open');} });
  saveSettings.addEventListener('click', saveSettingsFn);
  
  preset.addEventListener('change', () => {
    const pre = applyPreset(preset.value);
    if(pre) { roundsInput.value=pre.rounds; workInput.value=pre.work; restInput.value=pre.rest; }
  });

  // NEW: Force preset to 'custom' when user types in inputs
  function setCustomPreset() { preset.value = 'custom'; }
  roundsInput.addEventListener('input', setCustomPreset);
  workInput.addEventListener('input', setCustomPreset);
  restInput.addEventListener('input', setCustomPreset);

  document.addEventListener('keydown', (e) => {
    const key = (e.key||'').toLowerCase();
    if (key === ' ' || e.code === 'Space') { e.preventDefault(); toggleTimer(); }
    if (key === 'l') recordLap();
    if (key === 'r') resetAll();
    if (key === 's') openSettings();
    if (key === 'escape' && dlg.open) dlg.close();
  });

  // Init
  setTabs();
  setUIState();
})();