const biscuit = document.getElementById('biscuit');
const customTime = document.getElementById('customTime');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const displayTime = document.getElementById('displayTime');
const progressInner = document.getElementById('progressInner');
const statusText = document.getElementById('statusText');
const finishedBox = document.getElementById('finishedBox');
const soundToggle = document.getElementById('soundToggle');

let totalSeconds = 0;
let remaining = 0;
let timerId = null;
let running = false;
let paused = false;

// Alarm sound
const audioCtx = (typeof AudioContext !== 'undefined') ? new AudioContext() : null;

function playAlarm(){
  if(!audioCtx) return;
  if(audioCtx.state === 'suspended') audioCtx.resume();
  const now = audioCtx.currentTime;
  const gain = audioCtx.createGain();
  gain.gain.value = 0.8;
  gain.connect(audioCtx.destination);
  const freqs = [880, 880, 660];
  let t = now;
  freqs.forEach(f => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 0.45);
    t += 0.55;
  });
}

function secsToMMSS(s){
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return String(mm).padStart(2,'0') + ':' + String(ss).padStart(2,'0');
}

function updateDisplay(){
  displayTime.textContent = secsToMMSS(remaining);
  const pct = totalSeconds ? ((totalSeconds - remaining)/totalSeconds)*100 : 0;
  progressInner.style.width = pct + '%';
  if(running) statusText.textContent = `Soaking — ${remaining}s left`;
  else if(paused) statusText.textContent = `Paused — ${remaining}s left`;
  else statusText.textContent = 'Ready — choose and press Start.';
}

function startTimer(){
  const custom = parseFloat(customTime.value);
  let base = parseFloat(biscuit.value);
  if(!isNaN(custom) && custom > 0) base = custom;
  totalSeconds = Math.max(1, Math.round(base));
  remaining = totalSeconds;
  running = true; paused = false;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  resetBtn.disabled = false;
  finishedBox.classList.remove('show');
  updateDisplay();
  if(timerId) clearInterval(timerId);
  timerId = setInterval(()=>{
    if(!running) return;
    if(remaining <= 0){
      clearInterval(timerId);
      running = false;
      paused = false;
      onFinish();
      return;
    }
    remaining--;
    updateDisplay();
  }, 1000);
}

function pauseTimer(){
  if(!running) { 
    running = true; paused = false; pauseBtn.textContent = 'Pause';
  } else {
    running = false; paused = true; pauseBtn.textContent = 'Resume';
  }
  updateDisplay();
}

function resetTimer(){
  if(timerId) clearInterval(timerId);
  running = false; paused = false; remaining = 0; totalSeconds = 0;
  startBtn.disabled = false; pauseBtn.disabled = true; pauseBtn.textContent='Pause';
  resetBtn.disabled = true;
  finishedBox.classList.remove('show');
  updateDisplay();
}

function onFinish(){
  displayTime.textContent = '00:00';
  progressInner.style.width = '100%';
  finishedBox.classList.add('show');
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resetBtn.disabled = false;
  statusText.textContent = 'Done — take your biscuit out!';
  if(soundToggle.checked) playAlarm();
  if(navigator.vibrate) navigator.vibrate([300,150,300]);
}

// Event listeners
biscuit.addEventListener('change', ()=>{
  if(!running){
    totalSeconds = parseInt(biscuit.value,10);
    remaining = totalSeconds;
    updateDisplay();
  }
});
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Initial setup
(function init(){
  totalSeconds = parseInt(biscuit.value,10);
  remaining = totalSeconds;
  updateDisplay();
})();
