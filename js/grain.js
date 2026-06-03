const grainCanvas = document.getElementById('grainCanvas');
const grainCtx = grainCanvas.getContext('2d');

// Целевой FPS для зерна — полная частота кадров дорого стоит
const GRAIN_FPS = 15;
const GRAIN_INTERVAL = 1000 / GRAIN_FPS;
let lastGrainTime = 0;
let grainRafId = null;

function resizeGrain() {
    grainCanvas.width = window.innerWidth;
    grainCanvas.height = window.innerHeight;
}

function drawGrain(timestamp) {
    // Пауза, если вкладка не активна
    if (document.hidden) {
        grainRafId = requestAnimationFrame(drawGrain);
        return;
    }

    // Throttle до GRAIN_FPS
    if (timestamp - lastGrainTime < GRAIN_INTERVAL) {
        grainRafId = requestAnimationFrame(drawGrain);
        return;
    }
    lastGrainTime = timestamp;

    const w = grainCanvas.width;
    const h = grainCanvas.height;

    grainCtx.clearRect(0, 0, w, h);

    const imgData = grainCtx.createImageData(w, h);
    const buffer = new Uint32Array(imgData.data.buffer);

    for (let i = 0; i < buffer.length; i++) {
        if (Math.random() < 0.5) {
            buffer[i] = 0xff000000 | (Math.random() * 255);
        }
    }

    grainCtx.putImageData(imgData, 0, 0);

    grainRafId = requestAnimationFrame(drawGrain);
}

// Дебаунс для resize
let resizeTimer = null;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeGrain, 200);
});

resizeGrain();
grainRafId = requestAnimationFrame(drawGrain);
