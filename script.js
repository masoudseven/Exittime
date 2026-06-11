// ۱. مدیریت ویجت تقویم و آب و هوای زنده تهران
document.addEventListener("DOMContentLoaded", async () => {
    // تنظیم تقویم محلی سیستم به شمسی
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById("calendarBox").innerText = "📅 " + new Date().toLocaleDateString('fa-IR', options);
    
    // دریافت مستقیم دمای لحظه‌ای تهران با مختصات دقیق
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=35.6892&longitude=51.3890&current_weather=true`);
        const data = await response.json();
        const temp = Math.round(data.current_weather.temperature);
        
        document.getElementById("weatherBox").innerText = `🌡️ دمای تهران: ${temp}°C`;
    } catch (error) {
        document.getElementById("weatherBox").innerText = "☀️ تهران: در حال به‌روزرسانی...";
    }
});

// ۲. محاسبه ساعت خروج و راه اندازی تایمر (دقیقاً با متن‌های نسخه اول شما)
let timerInterval;
function calculateExit() {
    const hour = parseInt(document.getElementById("entryHour").value);
    const minute = parseInt(document.getElementById("entryMinute").value);

    if (isNaN(hour) || isNaN(minute)) {
        alert("لطفاً ساعت و دقیقه ورود را درست وارد کنید.");
        return;
    }

    // محاسبه بر اساس استاندارد ۸ ساعت و ۴۵ دقیقه زمان حضور
    let exitHour = hour + 8;
    let exitMinute = minute + 45;

    if (exitMinute >= 60) {
        exitHour += 1;
        exitMinute -= 60;
    }

    const pad = (num) => num.toString().padStart(2, '0');
    
    // بازگرداندن دقیق متن نسخه اول شما
    document.getElementById("exitTimeText").innerText = `ساعت آزادی شما: ${pad(exitHour)}:${pad(exitMinute)}`;
    document.getElementById("resultBox").style.display = "block";

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
            // متن نسخه اول شما هنگام پایان زمان کاری
            document.getElementById("countdownTimer").innerText = "تایمت تمومه! بدو برو که آزادی 🎉";
            clearInterval(timerInterval);
            return;
        }

        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);

        const pad = (num) => num.toString().padStart(2, '0');
        // متن نسخه اول شما برای تایمر معکوس ثانیه‌شمار
        document.getElementById("countdownTimer").innerText = `زمان باقی‌مانده: ${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }, 1000);
}

// ۳. دکمه فرار سریع (نمایش ترازنامه مالی در اکسل)
function togglePanic() {
    const excel = document.getElementById("excelScreen");
    if (excel.style.display === "none" || excel.style.display === "") {
        excel.style.display = "block";
    } else {
        excel.style.display = "none";
    }
}

// فرار سریع با زدن دکمه Escape کیبورد
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") togglePanic();
});

// ۴. بخش مخفی بازی (Easter Egg) با ۵ بار کلیک روی فوتر
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

// --- هوش مصنوعی ارتقایافته دوز (The Snitch) ---
let board = ["", "", "", "", "", "", "", "", ""];
const cells = document.querySelectorAll(".cell");
cells.forEach(cell => cell.addEventListener("click", handleCellClick));

const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
];

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
    // ۱. بررسی شانس برد مستقیم سیستم (O)
    for (let pattern of winPatterns) {
        let countO = pattern.filter(idx => board[idx] === "O").length;
        let countEmpty = pattern.filter(idx => board[idx] === "").length;
        if (countO === 2 && countEmpty === 1) {
            let targetIdx = pattern.find(idx => board[idx] === "");
            makeMove(targetIdx);
            return;
        }
    }

    // ۲. بررسی شانس برد کاربر (X) جهت دفاع و بلاک کردن
    for (let pattern of winPatterns) {
        let countX = pattern.filter(idx => board[idx] === "X").length;
        let countEmpty = pattern.filter(idx => board[idx] === "").length;
        if (countX === 2 && countEmpty === 1) {
            let targetIdx = pattern.find(idx => board[idx] === "");
            makeMove(targetIdx);
            return;
        }
    }

    // ۳. گرفتن خانه استراتژیک وسط در صورت خالی بودن
    if (board[4] === "") {
        makeMove(4);
        return;
    }

    // ۴. انتخاب رندوم از بین خانه‌های باقی‌مانده
    let emptyCells = board.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
    if (emptyCells.length === 0) return;
    let randomIdx = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    makeMove(randomIdx);
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

// متن ابتدایی بازی دوز نسخه شما
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
