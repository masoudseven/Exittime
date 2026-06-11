// ۱. مدیریت ویجت‌های هدر (تقویم شمسی، تقویم میلادی و آب و هوا)
document.addEventListener("DOMContentLoaded", async () => {
    // تقویم محلی شمسی
    const shamsiOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    document.getElementById("calendarBox").innerText = "📅 " + new Date().toLocaleDateString('fa-IR', shamsiOptions);
    
    // تقویم میلادی واقعی و کامل
    const gregorianOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    document.getElementById("gregorianTimeBox").innerText = "🌐 " + new Date().toLocaleDateString('en-US', gregorianOptions);
    
    // دریافت مستقیم دمای لحظه‌ای تهران
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=35.6892&longitude=51.3890&current_weather=true`);
        const data = await response.json();
        const temp = Math.round(data.current_weather.temperature);
        document.getElementById("weatherBox").innerText = `🌡️ تهران: ${temp}°C`;
    } catch (error) {
        document.getElementById("weatherBox").innerText = "☀️ تهران: --";
    }
});

// ۲. منطق محاسباتی اصلی شما به همراه تایمر هوشمند
let abortController = null;
let countdownInterval = null;

function calculateTime() {
  let hour = parseInt(document.getElementById("hourInput").value);
  let minute = parseInt(document.getElementById("minuteInput").value);
  const errorBox = document.getElementById("errorBox");
  const resultBox = document.getElementById("result");
  const calculatedTime = document.getElementById("calculatedTime");
  const countdownBox = document.getElementById("countdownBox");

  if (countdownInterval) clearInterval(countdownInterval);
  resultBox.classList.remove("show");
  calculatedTime.innerHTML = "";
  countdownBox.innerHTML = "";

  const prevLine = document.getElementById('timeStatusLine');
  if (prevLine) prevLine.remove();

  const prevWarn = document.getElementById('timeWarningLine');
  if (prevWarn) prevWarn.remove();

  if (
    isNaN(hour) ||
    isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    errorBox.textContent =
      "یعنی اینقد عجله داری بری که تایم ورودتو اشتباه زدی😄، ساعت باید بین 0 تا 23 و دقیقه بین 0 تا 59 باشه";
    errorBox.classList.add("show");
    return;
  }

  errorBox.classList.remove("show");
  errorBox.textContent = "";

  let totalInputMinutes = hour * 60 + minute;
  let workStartLimit = 9 * 60;
  let earlyBirdLimit = 7 * 60;
  const pad = (n) => n.toString().padStart(2, "0");

  let targetExitHour = 17;
  let targetExitMinute = 45;

  if (totalInputMinutes < earlyBirdLimit) {
    let baseMinutes = earlyBirdLimit + 8 * 60 + 45;
    targetExitHour = Math.floor(baseMinutes / 60) % 24;
    targetExitMinute = baseMinutes % 60;
    calculatedTime.innerHTML = `
      ${pad(targetExitHour)}:${pad(targetExitMinute)}
      <span class="message message-early">تو که هنوز آفتاب نزده اومدی😨 </span>
    `;
  } else if (totalInputMinutes <= workStartLimit) {
    let totalMinutes = totalInputMinutes + 8 * 60 + 45;
    targetExitHour = Math.floor(totalMinutes / 60) % 24;
    targetExitMinute = totalMinutes % 60;
    calculatedTime.innerHTML = `${pad(targetExitHour)}:${pad(targetExitMinute)}`;
  } else {
    let delayMinutes = totalInputMinutes - workStartLimit;
    let delayHourPart = Math.floor(delayMinutes / 60);
    let delayMinutePart = delayMinutes % 60;

    let delayStr = "";
    if (delayHourPart > 0) delayStr += `${delayHourPart} ساعت `;
    if (delayMinutePart > 0) delayStr += `${delayMinutePart} دقیقه `;

    calculatedTime.innerHTML = `
      17:45
      <span class="message message-late-info"> خواب موندی یا بازم همون بهونه همیشگی که اسنپ دیر اومد ؟ 😒 </span>
      <span class="message message-leave-warning">حالا باید ${delayStr.trim()} مرخصی بگیری</span>
    `;
  }

  const tempLine = document.createElement('span');
  tempLine.textContent = '⏳ در حال بررسی زمان دقیق ...';
  tempLine.classList.add('message');
  tempLine.style.marginTop = '10px';
  tempLine.style.display = 'block';
  tempLine.style.color = 'hotpink';
  tempLine.id = 'timeStatusLine';
  document.getElementById('result').appendChild(tempLine);

  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();
  const signal = abortController.signal;

  const useLocalTime = () => {
    const now = new Date();
    handleTimeResult(now, null);
  };

  const handleTimeResult = (now, globalNow) => {
    const nowTotalMinutes = now.getHours() * 60 + now.getMinutes();
    let diff = 0;

    if (totalInputMinutes < earlyBirdLimit) {
      diff = (earlyBirdLimit + 8 * 60 + 45) - nowTotalMinutes;
    } else if (totalInputMinutes <= workStartLimit) {
      diff = (totalInputMinutes + 8 * 60 + 45) - nowTotalMinutes;
    } else {
      diff = (17 * 60 + 45) - nowTotalMinutes;
    }

    if (diff > 0) {
      const hrs = Math.floor(diff / 60);
      const mins = diff % 60;

      if (hrs >= 1) {
        tempLine.textContent = `⏳ ${hrs} ساعت و ${mins} دقیقه دیگه مونده تا بتونی بری خوشگلم 😃`;
      } else {
        tempLine.textContent = `⏳ فقط ${mins} دقیقه دیگه مونده تا بری خوشگلم 😎`;
      }
      
      setupLiveCountdown(targetExitHour, targetExitMinute);
      
    } else {
      const passed = Math.abs(diff);
      const hrs = Math.floor(passed / 60);
      const mins = passed % 60;

      if (hrs >= 1) {
        tempLine.textContent = `✅ وقت رفتنت ${hrs} ساعت و ${mins} دقیقه پیش بوده، چرا هنوز موندی خوشگلم؟ 🤨`;
      } else {
        tempLine.textContent = `✅ وقت رفتنت ${mins} دقیقه پیش بوده خوشگلم! زود جمع کن برو 😅`;
      }
      countdownBox.innerHTML = "🎉 تایمت تمومه! بدو برو";
      countdownBox.className = "countdown-container timer-safe";
    }

    if (globalNow) {
      const localNow = new Date();
      const deltaSeconds = Math.abs((globalNow.getTime() - localNow.getTime()) / 1000);
      if (deltaSeconds > 300) {
        const warn = document.createElement('div');
        warn.textContent = "⏰ ساعت سیستمت تنظیم نیستا عزیزم، چکش کن 😉";
        warn.style.color = 'orange';
        warn.style.marginTop = '8px';
        warn.id = 'timeWarningLine';
        document.getElementById('result').appendChild(warn);
      }
    }
  };

  fetch('https://worldtimeapi.org/api/timezone/Asia/Tehran', { signal })
    .then(response => response.json())
    .then(data => {
      if (abortController.signal.aborted) return;
      const now = new Date(data.datetime);
      handleTimeResult(now, now);
    })
    .catch(err => {
      if (err.name === 'AbortError') return;
      useLocalTime();
    });

  setTimeout(() => {
    if (!abortController.signal.aborted) {
      abortController.abort();
      useLocalTime();
    }
  }, 1000);

  setTimeout(() => {
    resultBox.classList.add("show");
  }, 10);
}

function setupLiveCountdown(exitH, exitM) {
    const countdownBox = document.getElementById("countdownBox");
    
    function updateTimer() {
        const now = new Date();
        const target = new Date();
        target.setHours(exitH, exitM, 0, 0);
        
        const timeDiff = target - now;
        
        if (timeDiff <= 0) {
            countdownBox.innerHTML = "⏱️ زمان خروج فرا رسید! وقت فراره 🚀";
            countdownBox.className = "countdown-container timer-safe";
            clearInterval(countdownInterval);
            return;
        }
        
        const totalSeconds = Math.floor(timeDiff / 1000);
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        
        const pad = (n) => n.toString().padStart(2, "0");
        countdownBox.innerHTML = `⏱️ شمارش معکوس تا خروج: ${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
        
        if (totalSeconds > 3600) {
            countdownBox.className = "countdown-container timer-safe";
        } else if (totalSeconds <= 3600 && totalSeconds > 900) {
            countdownBox.className = "countdown-container timer-warning";
        } else {
            countdownBox.className = "countdown-container timer-critical";
        }
    }
    
    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
}

// ۳. شیت اکسل فیک فقط و فقط با دکمه Escape کیبورد باز و بسته می‌شود
function togglePanic() {
    const excel = document.getElementById("excelScreen");
    excel.style.display = (excel.style.display === "block") ? "none" : "block";
}
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") togglePanic();
});

// ۴. بخش بازی مخفی دوز (۵ کلیک روی متن Powered by Mason در فوتر)
let clickCount = 0;
function triggerEasterEgg() {
    clickCount++;
    if (clickCount === 5) {
        document.getElementById("easterEggZone").style.display = "block";
        document.getElementById("easterEggZone").scrollIntoView({ behavior: 'smooth' });
        resetTicTacToe();
    }
}

const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
];

let board = ["", "", "", "", "", "", "", "", ""];
const cells = document.querySelectorAll(".cell");
cells.forEach(cell => cell.addEventListener("click", handleCellClick));

function handleCellClick(e) {
    const index = e.target.getAttribute("data-index");
    if (board[index] !== "" || checkWin(board, "X") || checkWin(board, "O")) return;

    board[index] = "X";
    e.target.innerText = "X";

    if (checkWin(board, "X")) {
        document.getElementById("tttStatus").innerText = "تبریک! The Snitch رو شکست دادی، نتونست آمارِتو لو بده! 🤫";
        return;
    }
    if (!board.includes("")) {
        document.getElementById("tttStatus").innerText = "مساوی شد! هردو خسته نباشید 🤝";
        return;
    }
    setTimeout(snitchMove, 300);
}

function snitchMove() {
    for (let pattern of winPatterns) {
        let countO = pattern.filter(idx => board[idx] === "O").length;
        let countEmpty = pattern.filter(idx => board[idx] === "").length;
        if (countO === 2 && countEmpty === 1) { makeMove(pattern.find(idx => board[idx] === "")); return; }
    }
    for (let pattern of winPatterns) {
        let countX = pattern.filter(idx => board[idx] === "X").length;
        let countEmpty = pattern.filter(idx => board[idx] === "").length;
        if (countX === 2 && countEmpty === 1) { makeMove(pattern.find(idx => board[idx] === "")); return; }
    }
    if (board[4] === "") { makeMove(4); return; }
    let emptyCells = board.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
    if (emptyCells.length === 0) return;
    makeMove(emptyCells[Math.floor(Math.random() * emptyCells.length)]);
}

function makeMove(index) {
    board[index] = "O";
    document.querySelector(`[data-index='${index}']`).innerText = "O";
    if (checkWin(board, "O")) {
        document.getElementById("tttStatus").innerText = "The Snitch برنده شد! بدو برو سر کارت تا چغلیتو به مدیر نکرده! 🏃‍♂️💨";
    } else if (!board.includes("")) {
        document.getElementById("tttStatus").innerText = "مساوی شد! هردو خسته نباشید 🤝";
    }
}
function checkWin(b, player) {
    return winPatterns.some(pattern => pattern.every(idx => b[idx] === player));
}
function resetTicTacToe() {
    board = ["", "", "", "", "", "", "", "", ""];
    cells.forEach(cell => cell.innerText = "");
    document.getElementById("tttStatus").innerText = "نوبت شماست (X)";
}
