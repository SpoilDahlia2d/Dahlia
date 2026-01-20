/* Configuration */
const CONFIG = {
    slideInverval: 2000,
    decayRate: 0.8, // Faster decay on mobile
    recoveryRate: 3,
    intenseThreshold: 30,
    walletStart: 3420.00,
    drainPerTick: 0.05
};

/* State */
let s = {
    active: false,
    survival: 100,
    touching: false,
    images: [],
    currentImgIdx: 0,
    wallet: CONFIG.walletStart,
    gpsLocked: false,
    startCoords: null
};

/* DOM Elements */
const bootScreen = document.getElementById('boot-screen');
const mainInterface = document.getElementById('main-interface');
const enterBtn = document.getElementById('enter-btn');
const survivalBar = document.getElementById('survival-bar');
const imageContainer = document.getElementById('image-container');
const shoutText = document.getElementById('shout-text');
const panicOverlay = document.getElementById('panic-overlay');
const walletVal = document.getElementById('wallet-balance');
const gpsDisplay = document.getElementById('gps-coords');
const selfieVideo = document.getElementById('selfie-cam');
const fingerprintZone = document.getElementById('fingerprint-zone');

/* --- AUDIO CONTEXT (Synthesized Drone & File) --- */
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
let osc;
const fileAudio = document.getElementById('hypno-audio');

function startDrone() {
    // 1. Start Synthesized Drone (Background Hum)
    osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 50;
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.05;

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();

    // 2. Play Custom Audio File (Hypnotic Track)
    if (fileAudio) {
        fileAudio.play().catch(e => console.log("Audio play failed (interaction needed)", e));
    }
}

function updateDrone() {
    if (!osc) return;
    // Pitch up drone as survival drops
    osc.frequency.value = 50 + (100 - s.survival) * 3;

    // Distort custom audio playback rate if stressed
    if (s.survival < 30 && fileAudio) {
        fileAudio.playbackRate = 0.8; // Slow/Scary
    } else if (fileAudio) {
        fileAudio.playbackRate = 1.0;
    }
}


/* --- INITIALIZATION --- */
enterBtn.addEventListener('click', async () => {
    // 1. Mobile Fullscreen
    try {
        if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            await document.documentElement.webkitRequestFullscreen();
        }
    } catch (e) { console.log("Fullscreen denied"); }

    // 2. Audio Resume
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    startDrone();

    // 3. Camera Access
    initCamera();

    // 4. GPS Access
    initGPS();

    // 5. UI Transition
    bootScreen.style.display = 'none';
    mainInterface.classList.remove('hidden');
    s.active = true;

    // 6. Start Loops
    requestAnimationFrame(gameLoop);
    startImageCycle();
    initCanvas();
    startEnergyVampire();

    // 7. Initial Shout
    shout("BIOMETRICS LOCKED");
    setTimeout(hideShout, 2000);

    // Vibrate
    if (navigator.vibrate) navigator.vibrate(200);
});

/* --- MOBILE SENSORS & API --- */
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false
        });
        selfieVideo.srcObject = stream;
    } catch (err) {
        console.error("Camera denied", err);
        shout("CAMERA ERROR: I AM BLIND");
    }
}

function initGPS() {
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            gpsDisplay.innerText = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

            if (!s.gpsLocked) {
                s.startCoords = { lat: latitude, lon: longitude };
                s.gpsLocked = true;
            } else {
                // Check distance (simple Pythagorean approx for small distances)
                const dLat = Math.abs(latitude - s.startCoords.lat);
                const dLon = Math.abs(longitude - s.startCoords.lon);
                // Rough limit
                if (dLat > 0.0002 || dLon > 0.0002) {
                    triggerPanic("DO NOT MOVE");
                    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 500]);
                }
            }
        });
    }
}

function startEnergyVampire() {
    // Burn CPU
    setInterval(() => {
        if (!s.active) return;
        for (let i = 0; i < 1000000; i++) {
            Math.sqrt(Math.random() * i);
        }
    }, 1000);
}


/* --- INPUT HANDLING (TOUCH) --- */
// Fingerprint Zone Logic
fingerprintZone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    s.touching = true;
    if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
});

fingerprintZone.addEventListener('touchend', (e) => {
    e.preventDefault();
    s.touching = false;
});

// Fallback for desktop mouse
fingerprintZone.addEventListener('mousedown', () => s.touching = true);
fingerprintZone.addEventListener('mouseup', () => s.touching = false);


/* --- MAIN LOOP --- */
function gameLoop() {
    if (!s.active) return;

    // Survival Mechanic
    if (s.touching) {
        s.survival = Math.min(100, s.survival + s.recoveryRate);
    } else {
        s.survival = Math.max(0, s.survival - s.decayRate);
    }

    // Render Bar
    survivalBar.style.width = s.survival + '%';

    // Panic Logic
    if (s.survival < 20) {
        survivalBar.style.backgroundColor = '#ff0000';
        document.body.classList.add('shake-hard');
        if (Math.random() > 0.9) glitchEffect();
        if (navigator.vibrate && Math.random() > 0.9) navigator.vibrate(100); // Random vibration
    } else {
        survivalBar.style.backgroundColor = '#0f0';
        document.body.classList.remove('shake-hard');
    }

    // Wallet Drain
    s.wallet -= CONFIG.drainPerTick;
    walletVal.innerText = '$' + s.wallet.toFixed(2);

    // Audio Update
    updateDrone();

    requestAnimationFrame(gameLoop);
}

/* --- VISUAL EFFECTS --- */
function shout(text) {
    shoutText.innerText = text;
    shoutText.classList.remove('hidden');
}

function hideShout() {
    shoutText.classList.add('hidden');
}

function triggerPanic(msg = "WHERE ARE YOU GOING?") {
    panicOverlay.style.opacity = 0.8;
    shout(msg);
    setTimeout(() => {
        panicOverlay.style.opacity = 0;
        hideShout();
    }, 2000);
}

function glitchEffect() {
    const filters = ['invert(1)', 'blur(5px)', 'contrast(5)', 'hue-rotate(90deg)'];
    document.body.style.filter = filters[Math.floor(Math.random() * filters.length)];
    setTimeout(() => {
        document.body.style.filter = 'none';
    }, 100);
}

/* --- IMAGE HANDLING (STATIC DEPLOYMENT) --- */
// Logic: Tries to load images named 1.jpg, 2.jpg... up to MAX_IMAGES
const MAX_IMAGES = 20; // You can increase this number if you upload more
let loadedImages = [];

function startImageCycle() {
    preloadImages();
    spawnLoop();
}

function preloadImages() {
    // Try to preload images 1.jpg to MAX_IMAGES
    // If they exist, add to loadedImages
    for (let i = 1; i <= MAX_IMAGES; i++) {
        const img = new Image();
        const src = `img/${i}.jpg`; // Assumes .jpg, user can change if png
        img.onload = () => {
            loadedImages.push(src);
            if (loadedImages.length === 1) {
                // Remove waiting text once at least one image is found
                updateImageDisplay();
            }
        };
        img.onerror = () => {
            // console.log(`Image ${i}.jpg not found (skip)`);
        };
        img.src = src;
    }
}

function spawnLoop() {
    if (!s.active) {
        requestAnimationFrame(spawnLoop);
        return;
    }

    // Only spawn if we have images
    if (loadedImages.length > 0) {
        let interval = CONFIG.slideInverval;
        // Intensity scaling
        const stressFactor = (100 - s.survival) / 100;
        interval = 1000 - (stressFactor * 900); // 1000ms -> 100ms

        // Spawn chance based on time (simple throttle)
        if (Math.random() > 0.1) spawnImage();

        setTimeout(spawnLoop, Math.max(100, interval));
    } else {
        // Retry loop if no images loaded yet
        setTimeout(spawnLoop, 1000);
    }
}

function updateImageDisplay() {
    // Clear initial wait text
    const placeholder = document.querySelector('.placeholder-msg');
    if (placeholder) placeholder.remove();
}

function spawnImage() {
    if (loadedImages.length === 0) return;

    // Pick Random Image from loaded ones
    const src = loadedImages[Math.floor(Math.random() * loadedImages.length)];

    const img = document.createElement('img');
    img.src = src;
    img.className = 'storm-img';

    // Random Properties
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 80 + 10;
    const rot = (Math.random() * 60) - 30;
    const scale = 0.5 + Math.random();

    img.style.left = x + '%';
    img.style.top = y + '%';
    img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`;
    img.style.zIndex = Math.floor(Math.random() * 100);

    // Glitch Filter Chance
    if (Math.random() > 0.8) {
        img.style.filter = `hue-rotate(${Math.random() * 90}deg) contrast(2)`;
    }

    imageContainer.appendChild(img);

    // Cleanup
    setTimeout(() => {
        if (img.parentNode) img.parentNode.removeChild(img);
    }, 3000);
}
// REMOVED: Drag & Drop Listeners
// REMOVED: File Input Logic


/* --- HYPNOTIC CANVAS --- */
function initCanvas() {
    const c = document.getElementById('hypno-canvas');
    const ctx = c.getContext('2d');

    let w, h;
    let t = 0;

    function resize() {
        w = c.width = window.innerWidth;
        h = c.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function draw() {
        if (!s.active) return;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, w, h);

        t += 0.05;

        ctx.save();
        ctx.translate(w / 2, h / 2);

        // Spiral
        ctx.beginPath();
        for (let i = 0; i < 100; i++) {
            const angle = 0.1 * i + t;
            const r = 5 * i;
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.strokeStyle = `hsl(${t * 50}, 100%, 50%)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
        requestAnimationFrame(draw);
    }
    draw();
}
