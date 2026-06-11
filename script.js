// ۱. مدیریت ویجت تقویم و آب و هوا
document.addEventListener("DOMContentLoaded", () => {
    // تقویم محلی سیستم به شمسی
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById("calendarBox").innerText = "📅 " + new Date().toLocaleDateString('fa-IR', options);
    
    // شبیه‌سازی هوای زمان خروج
    const weatherConditions = ["آفتابی و معتدل ☀️", "کمی ابری همراه با نسیم ⛅", "احتمال بارش پراکنده 🌧️", "هوای عالی برای پیاده‌روی 🍁"];
    const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    document.getElementById("weatherBox").innerText = "🌡️ خروج: " + randomWeather;
});

// ۲. محاسبه ساعت خروج و راه اندازی تایمر
let timerInterval;
function calculateExit() {
    const hour = parseInt(document.getElementById("entryHour").value);
    const minute = parseInt(document.getElementById("entryMinute").value);

    if (isNaN(hour) || isNaN(minute)) {
        alert("لطفاً ساعت و دقیقه ورود را درست وارد کنید.");
        return;
    }

    // فرستادن زمان خروج به میزان ۸ ساعت و ۴۵ دقیقه بعد از ورود (استاندارد شرکتی)
    let exitHour = hour + 8;
    let exitMinute = minute + 45;

    if (exitMinute >= 60) {
        exitHour += 1;
        exitMinute -= 60;
    }

    const pad = (num) => num.toString().padStart(2, '0');
    document.getElementById("exitTimeText").innerText = `ساعت آزادی شما: ${pad(exitHour)}:${pad(exitMinute)}`;
    document.getElementById("resultBox").style.display = "block";

    // فعال‌سازی تایمر معکوس زنده
    startCountdown(exitHour, exitMinute);
}

function startCountdown(targetHour, targetMinute) {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const now = new Date();
        const target = new Date();
        target.setHours(targetHour, targetMinute, 0);

        const diff = target - now;

        if (diff <= 0) {
            document.getElementById("countdownTimer").innerText = "تایمت تمومه! بدو برو که آزادی 🎉";
            clearInterval(timerInterval);
            return;
        }

        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);

        const pad = (num) => num.toString().padStart(2, '0');
        document.getElementById("countdownTimer").innerText = `زمان باقی‌مانده: ${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }, 1000);
}

// ۳. دکمه فرار سریع (اکسل فیک)
function togglePanic() {
    const excel = document.getElementById("excelScreen");
    if (excel.style.display === "none" || excel.style.display === "") {
        excel.style.display = "block";
    } else {
        excel.style.display = "none";
    }
}

// گوش دادن به دکمه Esc کیبورد برای فرار سریع
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") togglePanic();
});

// ۴. بخش مخفی بازی (Easter Egg)
let clickCount = 0;
function triggerEasterEgg() {
    clickCount++;
    if (clickCount === 5) {
        document.getElementById("easterEggZone").style.display = "block";
        document.getElementById("easterEggZone").scrollIntoView({ behavior: 'smooth' });
        resetTicTacToe();
    }
}

function switchGame(gameName) {
    if (gameName === 'ticTacToe') {
        document.getElementById("ticTacToeGame").style.display = "block";
        document.getElementById("rpsGame").style.display = "none";
    } else {
        document.getElementById("ticTacToeGame").style.display = "none";
        document.getElementById("rpsGame").style.display = "block";
    }
}

// --- بازی دوز با The Snitch ---
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

    // نوبت هوش مصنوعی (The Snitch)
    setTimeout(snitchMove, 400);
}

function snitchMove() {
    let emptyCells = board.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
    if (emptyCells.length === 0) return;

    let randomIdx = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[randomIdx] = "O";
    document.querySelector(`[data-index='${randomIdx}']`).innerText = "O";

    if (checkWin(board, "O")) {
        document.getElementById("tttStatus").innerText = "The Snitch برنده شد! بدو برو سر کارت تا چغلیتو به مدیر نکرده! 跑";
    }
}

function checkWin(b, player) {
    const winPatterns = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    return winPatterns.some(pattern => pattern.every(idx => b[idx] === player));
}

function resetTicTacToe() {
    board = ["", "", "", "", "", "", "", "", ""];
    cells.forEach(cell => cell.innerText = "");
    document.getElementById("tttStatus").innerText = "نوبت شماست (X)";
}

// --- بازی سنگ کاغذ قیچی ---
function playRPS(userChoice) {
    const choices = ['👊', '✋', '✌️'];
    const systemChoice = choices[Math.floor(Math.random() * choices.length)];
    let statusText = `شما: ${userChoice} | سیستم: ${systemChoice} -> `;

    if (userChoice === systemChoice) {
        statusText += "مساوی! دوباره بزن.";
    } else if (
        (userChoice === '👊' && systemChoice === '✌️') ||
        (userChoice === '✋' && systemChoice === '👊') ||
        (userChoice === '✌️' && systemChoice === '✋')
    ) {
        statusText += "بردی! سیستم مغلوب شد 😎";
    } else {
        statusText += "باختی! سیستم مچت رو خوابوند 🖥️";
    }
    document.getElementById("rpsStatus").innerText = statusText;
}
