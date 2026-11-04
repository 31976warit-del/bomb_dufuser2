let score = 0;
let level = 1;
let combo = 0;
let timeLeft = 10;
let maxTime = 10;
let timerInterval = null;
let currentProblem = null;
let usedHint = false;

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProblem() {
    usedHint = false;
    let a, b, x, result, eqText, steps;

    x = getRandomInt(1, 10 + Math.floor(level / 2));

    if (level <= 5) {
        let type = getRandomInt(1, 2);
        if (type === 1) {
            b = getRandomInt(2, 15);
            result = x + b;
            eqText = `x + ${b} = ${result}`;
            steps = `ย้าย +${b} ไปลบออก: x = ${result} - ${b} ➡️ <b>x = ${x}</b>`;
        } else {
            a = getRandomInt(2, 6);
            result = a * x;
            eqText = `${a}x = ${result}`;
            steps = `ย้าย ${a} ไปหาร: x = ${result} / ${a} ➡️ <b>x = ${x}</b>`;
        }
    } else if (level <= 10) {
        a = getRandomInt(2, 5);
        b = getRandomInt(1, 15);
        let isPlus = Math.random() > 0.5;

        if (isPlus) {
            result = (a * x) + b;
            eqText = `${a}x + ${b} = ${result}`;
            steps = `1. ย้าย +${b} ไปลบ: ${a}x = ${result} - ${b} = ${a*x}<br>2. ย้าย ${a} ไปหาร: x = ${a*x} / ${a} ➡️ <b>x = ${x}</b>`;
        } else {
            result = (a * x) - b;
            eqText = `${a}x - ${b} = ${result}`;
            steps = `1. ย้าย -${b} ไปบวก: ${a}x = ${result} + ${b} = ${a*x}<br>2. ย้าย ${a} ไปหาร: x = ${a*x} / ${a} ➡️ <b>x = ${x}</b>`;
        }
    } else {
        a = getRandomInt(3, 7);
        let c = getRandomInt(1, a - 1);
        b = getRandomInt(1, 10);
        let rightConst = (a - c) * x;
        eqText = `${a}x - ${b} = ${c}x + ${rightConst - b}`;
        let leftCoeff = a - c;
        let rightVal = rightConst;
        steps = `1. ย้ายตัวแปรไปอยู่ฝั่งเดียวกัน: (${a} - ${c})x = ${rightVal}<br>2. ได้ ${leftCoeff}x = ${rightVal}<br>3. ย้าย ${leftCoeff} ไปหาร: x = ${rightVal} / ${leftCoeff} ➡️ <b>x = ${x}</b>`;
    }

    let options = new Set([x]);
    while (options.size < 4) {
        let wrong = x + getRandomInt(-4, 5);
        if (wrong > 0 && wrong !== x) options.add(wrong);
    }

    currentProblem = {
        equation: eqText,
        answer: x,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        steps: steps
    };

    renderProblem();
}

function renderProblem() {
    document.getElementById('equation').innerText = currentProblem.equation;
    const container = document.getElementById('options-container');
    container.innerHTML = '';

    currentProblem.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.innerText = `x = ${opt}`;
        btn.onclick = () => checkAnswer(opt);
        container.appendChild(btn);
    });

    maxTime = Math.max(4, 12 );
    timeLeft = maxTime;
    updateTimerDisplay();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        if (timeLeft <= 0) {
            timeLeft = 0;
            gameOver();
        }
        updateTimerDisplay();
    }, 100);
}

function updateTimerDisplay() {
    const timerEl = document.getElementById('timer');
    const progressEl = document.getElementById('progress-bar');
    const body = document.body;

    timerEl.innerText = timeLeft.toFixed(1) + 's';
    const pct = (timeLeft / maxTime) * 100;
    progressEl.style.width = pct + '%';

    if (timeLeft <= 3) {
        timerEl.classList.add('urgent');
        body.classList.add('danger-bg');
    } else {
        timerEl.classList.remove('urgent');
        body.classList.remove('danger-bg');
    }
}
function checkAnswer(selected) {
    if (selected === currentProblem.answer) {
        combo++;
        let earned = 100 * combo;
        if (usedHint) earned = Math.floor(earned * 0.5);
        score += earned;
        level++;
        updateStats();
        generateProblem();
    } else {
        combo = 0;
        timeLeft = Math.max(0, timeLeft - 6);
        updateStats();
        triggerShake();
        if (timeLeft <= 0) gameOver();
    }
}

function triggerShake() {
    const box = document.getElementById('game-box');
    box.classList.add('shake');
    setTimeout(() => box.classList.remove('shake'), 300);
}

function showHint() {
    if (usedHint) return;
    usedHint = true;
    const btns = Array.from(document.querySelectorAll('#options-container .btn'));
    const wrongBtns = btns.filter(b => !b.innerText.includes(`x = ${currentProblem.answer}`));
    if (wrongBtns.length > 0) {
        wrongBtns[0].style.visibility = 'hidden';
    }
}

function updateStats() {
    document.getElementById('level-display').innerText = level;
    document.getElementById('score-display').innerText = score;
    document.getElementById('combo-display').innerText = `x${combo + 1}`;
}

function startGame() {
    score = 0;
    level = 1;
    combo = 0;
    updateStats();
    switchScreen('game-screen');
    generateProblem();
    startTimer();
}

function gameOver() {
    clearInterval(timerInterval);
    document.body.classList.remove('danger-bg');
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-level').innerText = level - 1;
    document.getElementById('explanation-text').innerHTML = `
        <b>โจทย์:</b> ${currentProblem.equation}<br>
        ${currentProblem.steps}
    `;
    switchScreen('gameover-screen');
}


function goHome() {
    clearInterval(timerInterval);
    document.body.classList.remove('danger-bg');
    switchScreen('start-screen');
}

function gameOver() {
    clearInterval(timerInterval);
    document.body.classList.remove('danger-bg');
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-level').innerText = level - 1;
    document.getElementById('explanation-text').innerHTML = `
        <b>โจทย์:</b> ${currentProblem.equation}<br>
        ${currentProblem.steps}
    `;
    
    // อัปเดตส่วนปุ่มควบคุมในหน้า Game Over
    const gameOverScreen = document.getElementById('gameover-screen');
    
    // ค้นหาหรือสร้างกลุ่มปุ่มกด
    let btnGroup = gameOverScreen.querySelector('.btn-group');
    if (!btnGroup) {
        btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';
        gameOverScreen.appendChild(btnGroup);
    }
    
    btnGroup.innerHTML = `
       
        <button class="btn-action btn-home" onclick="goHome()">กลับหน้าแรก 🏠</button>
    `;

    switchScreen('gameover-screen');
}