const pagesTrack = document.getElementById('pagesTrack');
const hudClock = document.getElementById('hudClock');
const currentDayLabel = document.getElementById('currentDayLabel');
const pageNumIndicator = document.getElementById('pageNumIndicator');
const subNavTabs = document.querySelectorAll('.sub-nav-link');

let currentActivePage = 0;
const totalPagesCount = 4;

function runDashboardClock() {
  const current = new Date();
  let hr = current.getHours();
  let min = current.getMinutes();
  let sec = current.getSeconds();
  
  if (hr < 10) hr = '0' + hr;
  if (min < 10) min = '0' + min;
  if (sec < 10) sec = '0' + sec;
  
  hudClock.textContent = hr + ':' + min + ':' + sec;
}
setInterval(runDashboardClock, 1000);
runDashboardClock();

function syncLocalCalendarDay() {
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const current = new Date();
  currentDayLabel.textContent = days[current.getDay()];
}
syncLocalCalendarDay();

function jumpToWorkspacePage(slideIndex) {
  currentActivePage = slideIndex;
  
  pagesTrack.style.transform = `translateX(-${slideIndex * 100}vw)`;
  pagesTrack.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
  
  subNavTabs.forEach((tab) => {
    if (parseInt(tab.getAttribute('data-tab')) === slideIndex) {
      tab.classList.add('active-tab');
    } else {
      tab.classList.remove('active-tab');
    }
  });
  
  pageNumIndicator.textContent = slideIndex + 1;
}

function stepToNextWorkspacePage() {
  let nextIdx = currentActivePage + 1;
  if (nextIdx >= totalPagesCount) nextIdx = 0;
  jumpToWorkspacePage(nextIdx);
}

const dictionaryList = ["matrix", "minimalist", "premium", "aesthetic", "interface", "typography", "velocity", "harmony", "resonance", "sculpted", "silhouette", "minimal", "creative", "precision", "fluid", "canopy", "horizon", "artisan", "production", "workspace"];
const scoreboardLogsContainer = document.getElementById('scoreboardLogsContainer');

scoreboardLogsContainer.innerHTML = '<div class="empty-state-msg">No high scores registered in session logs yet.</div>';

function logScoreToMatrix(modeLabel, primaryScore, subLabel) {
  if (scoreboardLogsContainer.querySelector('.empty-state-msg')) {
    scoreboardLogsContainer.innerHTML = '';
  }
  const entryRow = document.createElement('div');
  entryRow.className = 'interactive-entry-row';
  entryRow.innerHTML = `<span class="entry-main-text">${modeLabel} // <strong>${primaryScore}</strong></span><span class="entry-sub-tag">${subLabel}</span>`;
  scoreboardLogsContainer.appendChild(entryRow);
}

function wipeScoreboardMatrixLogs() {
  scoreboardLogsContainer.innerHTML = '<div class="empty-state-msg">No high scores registered in session logs yet.</div>';
}

const speedWordsDisplay = document.getElementById('speedWordsDisplay');
const speedInputBox = document.getElementById('speedInputBox');
const wpmDisplay = document.getElementById('wpmDisplay');
const timerDisplay = document.getElementById('timerDisplay');

let speedWordsArray = [];
let speedCurrentIdx = 0;
let speedTimerLeft = 30;
let speedWordsCorrect = 0;
let speedGameRunning = false;
let speedClockTimer = null;

function renderSpeedWordsCanvas() {
  speedWordsArray = Array.from({ length: 40 }, () => dictionaryList[Math.floor(Math.random() * dictionaryList.length)]);
  speedCurrentIdx = 0;
  refreshSpeedHTMLField();
}

function refreshSpeedHTMLField() {
  speedWordsDisplay.innerHTML = speedWordsArray.map((word, index) => {
    if (index === speedCurrentIdx) return `<span class="word-current-focus">${word}</span>`;
    if (index < speedCurrentIdx) return `<span class="word-correct-pass">${word}</span>`;
    return `<span>${word}</span>`;
  }).join(' ');
}

function triggerSpeedCountdown() {
  speedClockTimer = setInterval(() => {
    speedTimerLeft--;
    timerDisplay.textContent = speedTimerLeft + 's';
    
    if (speedTimerLeft <= 0) {
      clearInterval(speedClockTimer);
      speedGameRunning = false;
      speedInputBox.disabled = true;
      speedInputBox.value = '';
      
      const calculatedWPM = Math.round((speedWordsCorrect / 30) * 60);
      wpmDisplay.textContent = calculatedWPM;
      logScoreToMatrix("VELOCITY SPRINT", calculatedWPM + " WPM", "TIMER END");
    }
  }, 1000);
}

speedInputBox.addEventListener('input', () => {
  if (!speedGameRunning && speedTimerLeft === 30) {
    speedGameRunning = true;
    triggerSpeedCountdown();
  }
  
  const currentInputValue = speedInputBox.value;
  const targetTargetWord = speedWordsArray[speedCurrentIdx];
  
  if (currentInputValue.endsWith(' ')) {
    const spaceStrippedInput = currentInputValue.trim();
    if (spaceStrippedInput === targetTargetWord) {
      speedWordsCorrect++;
      const currentRealtimeWPM = Math.round((speedWordsCorrect / (30 - speedTimerLeft)) * 60);
      wpmDisplay.textContent = isFinite(currentRealtimeWPM) ? currentRealtimeWPM : 0;
    }
    speedCurrentIdx++;
    speedInputBox.value = '';
    refreshSpeedHTMLField();
  }
});

function resetSpeedTestGame() {
  clearInterval(speedClockTimer);
  speedTimerLeft = 30;
  speedWordsCorrect = 0;
  speedGameRunning = false;
  speedInputBox.disabled = false;
  speedInputBox.value = '';
  wpmDisplay.textContent = '00';
  timerDisplay.textContent = '30s';
  renderSpeedWordsCanvas();
}
renderSpeedWordsCanvas();

const accuracyWordsDisplay = document.getElementById('accuracyWordsDisplay');
const accuracyInputBox = document.getElementById('accuracyInputBox');
const accuracyPctDisplay = document.getElementById('accuracyPctDisplay');
const errorCountDisplay = document.getElementById('errorCountDisplay');
const comboCountDisplay = document.getElementById('comboCountDisplay');

let drillWordsArray = [];
let drillCurrentIdx = 0;
let totalDrillKeystrokes = 0;
let drillMistakesCount = 0;
let drillComboStreak = 0;

function renderAccuracyWordsCanvas() {
  drillWordsArray = Array.from({ length: 40 }, () => dictionaryList[Math.floor(Math.random() * dictionaryList.length)]);
  drillCurrentIdx = 0;
  refreshAccuracyHTMLField();
}

function refreshAccuracyHTMLField() {
  accuracyWordsDisplay.innerHTML = drillWordsArray.map((word, index) => {
    if (index === drillCurrentIdx) return `<span class="word-current-focus">${word}</span>`;
    if (index < drillCurrentIdx) return `<span class="word-correct-pass">${word}</span>`;
    return `<span>${word}</span>`;
  }).join(' ');
}

accuracyInputBox.addEventListener('input', () => {
  const currentInput = accuracyInputBox.value;
  const targetWord = drillWordsArray[drillCurrentIdx];
  totalDrillKeystrokes++;
  
  if (!targetWord.startsWith(currentInput)) {
    drillMistakesCount++;
    drillComboStreak = 0;
    accuracyInputBox.style.color = '#ff4757';
    errorCountDisplay.textContent = drillMistakesCount < 10 ? '0' + drillMistakesCount : drillMistakesCount;
    comboCountDisplay.textContent = '00';
  } else {
    accuracyInputBox.style.color = 'var(--text-pure)';
  }
  
  const currentCalculatedAcc = Math.round(((totalDrillKeystrokes - drillMistakesCount) / totalDrillKeystrokes) * 100);
  accuracyPctDisplay.textContent = Math.max(0, currentCalculatedAcc) + '%';
  
  if (currentInput.endsWith(' ')) {
    if (currentInput.trim() === targetWord) {
      drillComboStreak++;
      comboCountDisplay.textContent = drillComboStreak < 10 ? '0' + drillComboStreak : drillComboStreak;
      
      if (drillCurrentIdx === drillWordsArray.length - 1) {
        logScoreToMatrix("PRECISION DRILL", accuracyPctDisplay.textContent + " ACC", "MAX COMBO: " + drillComboStreak);
        accuracyInputBox.disabled = true;
        accuracyInputBox.value = '';
      }
    }
    drillCurrentIdx++;
    accuracyInputBox.value = '';
    refreshAccuracyHTMLField();
  }
});

function resetAccuracyDrillGame() {
  drillCurrentIdx = 0;
  totalDrillKeystrokes = 0;
  drillMistakesCount = 0;
  drillComboStreak = 0;
  accuracyInputBox.disabled = false;
  accuracyInputBox.value = '';
  accuracyInputBox.style.color = 'var(--text-pure)';
  accuracyPctDisplay.textContent = '100%';
  errorCountDisplay.textContent = '00';
  comboCountDisplay.textContent = '00';
  renderAccuracyWordsCanvas();
}
renderAccuracyWordsCanvas();

const customQuoteCreator = document.getElementById('customQuoteCreator');
const customWordsDisplay = document.getElementById('customWordsDisplay');
const customInputBox = document.getElementById('customInputBox');

let customWordsArray = [];
let customCurrentIdx = 0;

customQuoteCreator.addEventListener('input', () => {
  const customRawText = customQuoteCreator.value.trim();
  if (customRawText.length < 5) {
    customInputBox.disabled = true;
    customWordsDisplay.textContent = "Inject quote first then type...";
    return;
  }
  
  customWordsArray = customRawText.split(/\s+/);
  customCurrentIdx = 0;
  customInputBox.disabled = false;
  refreshCustomHTMLField();
});

function refreshCustomHTMLField() {
  customWordsDisplay.innerHTML = customWordsArray.map((word, index) => {
    if (index === customCurrentIdx) return `<span class="word-current-focus">${word}</span>`;
    if (index < customCurrentIdx) return `<span class="word-correct-pass">${word}</span>`;
    return `<span>${word}</span>`;
  }).join(' ');
}

customInputBox.addEventListener('input', () => {
  const currentInput = customInputBox.value;
  const targetWord = customWordsArray[customCurrentIdx];
  
  if (currentInput.endsWith(' ')) {
    if (currentInput.trim() === targetWord) {
      if (customCurrentIdx === customWordsArray.length - 1) {
        logScoreToMatrix("SANDBOX SEED", "CLEARED", "CUSTOM RUN COMPLETE");
        customInputBox.value = '';
        customInputBox.disabled = true;
      }
    }
    customCurrentIdx++;
    customInputBox.value = '';
    refreshCustomHTMLField();
  }
});
