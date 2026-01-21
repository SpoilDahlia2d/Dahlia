/* Configuration */
const CONFIG = {
    passcode: "DAHLIA",
    unlockCode: "GOHARD", // New code to restart after payment
    spamInterval: 2000,
    itemsUntilPaywall: 25,
    worshipTimeout: 2500,
    words: ["WORSHIP", "OBEY", "LOSER", "WEAK", "PAY", "SUBMIT", "MINE", "CLICK"]
};

/* State */
let s = {
    level: 0,
    spamCount: 0,
    loadedImages: []
};

/* DOM Elements */
const lvl1 = document.getElementById('level-1-hack');
const lvl2 = document.getElementById('level-2-spam');
const lvl3 = document.getElementById('level-3-paywall');

const hackContainer = document.getElementById('hack-text-container');
const passcodeContainer = document.getElementById('passcode-container');
const passInput = document.getElementById('passcode-input');
const errorMsg = document.getElementById('error-msg');
const startBtn = document.getElementById('start-btn');

const spamContainer = document.getElementById('spam-container');
const audio = document.getElementById('hypno-audio');
const canvas = document.getElementById('hypno-canvas');

// Unlock / Restart Elements
const unlockInput = document.getElementById('unlock-input');
const unlockError = document.getElementById('unlock-error');
const flashOverlay = document.getElementById('flash-overlay') || createFlashOverlay();

function createFlashOverlay() {
    const d = document.createElement('div');
    d.id = 'flash-overlay';
    document.body.appendChild(d);
    return d;
}

/* --- START SEQUENCE --- */
startBtn.addEventListener('click', async () => {
    try { audio.play(); } catch (e) { }
    try { document.documentElement.requestFullscreen(); } catch (e) { }
    startBtn.classList.add('hidden');
    runHackSequence();
    initCanvas();
});

/* --- LEVEL 1: HACKER TERMINAL --- */
async function runHackSequence() {
    hackContainer.innerHTML = ""; // Reset
    const batt = await getBatteryLevel();
    const platform = navigator.platform;

    const logs = [
        "INITIALIZING DAHLIA.OS...",
        "BYPASSING FIREWALL...",
        `DETECTED PLATFORM: ${platform.toUpperCase()}`,
        `BATTERY STATUS: ${batt}%`,
        "ACCESSING GPS MODULE...",
        "GPS LOCKED: [45.4642, 9.1900]",
        "DOWNLOADING GALLERY...",
        "CONTACTS COPIED...",
        "SYSTEM VULNERABLE.",
        "UPLOAD PAUSED. USER INTERVENTION REQUIRED."
    ];

    let i = 0;
    function nextLog() {
        if (i >= logs.length) {
            showPasscode();
            return;
        }

        const div = document.createElement('div');
        div.className = 'log-line typing';
        div.innerText = "> " + logs[i];
        hackContainer.appendChild(div);

        setTimeout(() => {
            div.classList.remove('typing');
            i++;
            nextLog();
        }, 800 + Math.random() * 500);
    }
    nextLog();
}

async function getBatteryLevel() {
    try {
        const b = await navigator.getBattery();
        return Math.floor(b.level * 100);
    } catch (e) {
        return "UNKNOWN";
    }
}

function showPasscode() {
    passcodeContainer.classList.remove('hidden');
    passInput.focus();
}

passInput.addEventListener('input', () => {
    errorMsg.classList.add('hidden');
    if (passInput.value.toUpperCase() === CONFIG.passcode) {
        passInput.blur();
        startLevel2();
    }
});

passInput.addEventListener('change', () => {
    if (passInput.value.toUpperCase() !== CONFIG.passcode) {
        errorMsg.classList.remove('hidden');
        passInput.value = "";
        passInput.focus();
        if (navigator.vibrate) navigator.vibrate(200);
    }
});

/* --- LEVEL 2: SPAM & FORCE ADORATION --- */
function startLevel2() {
    lvl1.classList.add('hidden');
    lvl2.classList.remove('hidden');

    // Clear previous spam if any
    spamContainer.innerHTML = "";
    s.spamCount = 0;

    // Preload
    if (s.loadedImages.length === 0) {
        for (let i = 1; i <= 20; i++) {
            const img = new Image();
            img.src = `img/${i}.jpg`;
            img.onload = () => s.loadedImages.push(`img/${i}.jpg`);
        }
    }

    spamLoop();
}

function spamLoop() {
    // If we hit paywall limit
    if (s.spamCount >= CONFIG.itemsUntilPaywall) {
        triggerPaywall();
        return;
    }

    // Safety check if user somehow reset mid-loop
    if (lvl2.classList.contains('hidden')) return;

    s.spamCount++;
    const isImage = Math.random() > 0.4;

    if (isImage && s.loadedImages.length > 0) {
        spawnImage();
    } else {
        spawnWord();
    }

    setTimeout(spamLoop, CONFIG.spamInterval);
}

function spawnImage() {
    const src = s.loadedImages[Math.floor(Math.random() * s.loadedImages.length)];
    const img = document.createElement('img');
    img.src = src;
    img.className = 'spam-img';
    setRandomPos(img);

    let worshipTimer = setTimeout(() => {
        img.classList.add('ignored');
        failEffect();
    }, CONFIG.worshipTimeout);

    img.addEventListener('click', () => {
        if (img.classList.contains('ignored')) return;
        clearTimeout(worshipTimer);
        img.classList.add('worshipped');
    });

    spamContainer.appendChild(img);
}

function failEffect() {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    flashOverlay.style.opacity = 0.5;
    setTimeout(() => { flashOverlay.style.opacity = 0; }, 100);
    s.spamCount += 2;
}

function spawnWord() {
    const word = CONFIG.words[Math.floor(Math.random() * CONFIG.words.length)];
    const div = document.createElement('div');
    div.innerText = word;
    div.className = 'spam-word';
    setRandomPos(div);
    div.style.color = Math.random() > 0.5 ? '#fff' : '#ff00ff';
    div.style.fontSize = (2 + Math.random() * 3) + 'rem';
    spamContainer.appendChild(div);
}

function setRandomPos(el) {
    el.style.left = (10 + Math.random() * 80) + '%';
    el.style.top = (10 + Math.random() * 80) + '%';
    el.style.transform = `translate(-50%, -50%) rotate(${(Math.random() * 40) - 20}deg)`;
}

/* --- LEVEL 3: PAYWALL & RESTART --- */
function triggerPaywall() {
    lvl3.classList.remove('hidden');
    audio.playbackRate = 0.7; // Slow down audio
}

// Unlock / Restart Logic
unlockInput.addEventListener('input', () => {
    unlockError.classList.add('hidden');
    if (unlockInput.value.toUpperCase() === CONFIG.unlockCode) {
        resetGame();
    }
});

unlockInput.addEventListener('change', () => {
    if (unlockInput.value.toUpperCase() !== CONFIG.unlockCode) {
        unlockError.classList.remove('hidden');
        unlockInput.value = "";
        unlockInput.focus();
        if (navigator.vibrate) navigator.vibrate(500);
    }
});

function resetGame() {
    // Reset State
    unlockInput.value = "";
    s.spamCount = 0;

    // Hide Level 3, Show Level 1
    lvl3.classList.add('hidden');
    lvl2.classList.add('hidden');
    lvl1.classList.remove('hidden');

    // Reset Audio
    audio.playbackRate = 1.0;

    // Restart Hack Sequence
    runHackSequence();
}

/* --- CANVAS HYPNO --- */
function initCanvas() {
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    let t = 0;

    function draw() {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, 0, w, h);
        t += 0.1;
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 50; i++) {
            let r = i * 10 + Math.sin(t) * 50;
            ctx.moveTo(w / 2 + r, h / 2);
            ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
        }
        ctx.stroke();
        requestAnimationFrame(draw);
    }
    draw();
}
