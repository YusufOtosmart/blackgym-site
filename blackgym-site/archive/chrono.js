document.addEventListener("DOMContentLoaded", () => {
  const display = document.getElementById("display");
  const startStopBtn = document.getElementById("startStopBtn");
  const resetBtn = document.getElementById("resetBtn");
  const lapBtn = document.getElementById("lapBtn");
  const lapsList = document.getElementById("lapsList");
  const lapCountLabel = document.getElementById("lapCount");

  if (!display || !startStopBtn || !resetBtn || !lapBtn || !lapsList || !lapCountLabel) return;

  let startTime = 0;
  let elapsedTime = 0;
  let timerInterval = null;
  let isRunning = false;
  let laps = [];

  const vibrate = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch(e) {} };

  const formatTime = (time) => {
    const date = new Date(time);
    const m = date.getUTCMinutes().toString().padStart(2, "0");
    const s = date.getUTCSeconds().toString().padStart(2, "0");
    const ms = Math.floor(date.getUTCMilliseconds() / 10).toString().padStart(2, "0");
    return `${m}:${s}<span class="milliseconds">.${ms}</span>`;
  };

  const updateDisplay = () => { display.innerHTML = formatTime(elapsedTime); };

  const renderLaps = () => {
    lapsList.innerHTML = "";
    lapCountLabel.textContent = `${laps.length} Kayıt`;
    laps.forEach((lapTime, index) => {
      const li = document.createElement("li");
      li.className = "lap-item";
      li.innerHTML = `
        <span class="lap-index">#${laps.length - index}</span>
        <span class="lap-time">${formatTime(lapTime)}</span>
      `;
      lapsList.appendChild(li);
    });
  };

  const setUIState = () => {
    startStopBtn.classList.toggle("is-running", isRunning);
    startStopBtn.textContent = isRunning ? "DURAKLAT" : (elapsedTime > 0 ? "DEVAM ET" : "BAŞLAT");
    lapBtn.disabled = !isRunning;
  };

  const toggleTimer = () => {
    if (isRunning) {
      clearInterval(timerInterval);
      timerInterval = null;
      isRunning = false;
      setUIState();
      vibrate(10);
      return;
    }

    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(() => {
      elapsedTime = Date.now() - startTime;
      updateDisplay();
    }, 10);

    isRunning = true;
    setUIState();
    vibrate(15);
  };

  const resetTimer = () => {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    elapsedTime = 0;
    laps = [];
    updateDisplay();
    renderLaps();
    setUIState();
    vibrate(20);
  };

  const recordLap = () => {
    if (!isRunning) return;
    laps.unshift(elapsedTime);
    renderLaps();
    vibrate(12);
  };

  startStopBtn.addEventListener("click", toggleTimer);
  resetBtn.addEventListener("click", resetTimer);
  lapBtn.addEventListener("click", recordLap);

  document.addEventListener("keydown", (e) => {
    const key = (e.key || "").toLowerCase();
    if (key === " " || e.code === "Space") { e.preventDefault(); toggleTimer(); }
    if (key === "l") recordLap();
    if (key === "r") resetTimer();
  });

  updateDisplay();
  renderLaps();
  setUIState();
});
