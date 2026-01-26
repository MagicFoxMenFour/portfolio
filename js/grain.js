const grainCanvas = document.getElementById('grainCanvas');
const grainCtx = grainCanvas.getContext('2d');

function resizeGrain() {
    grainCanvas.width = window.innerWidth;
    grainCanvas.height = window.innerHeight;
}

function drawGrain() {
    const w = grainCanvas.width;
    const h = grainCanvas.height;
    
    // Очищаем
    grainCtx.clearRect(0, 0, w, h);
    
    // Генерируем шум
    // Создаем пустой буфер пикселей
    const imgData = grainCtx.createImageData(w, h);
    const buffer = new Uint32Array(imgData.data.buffer);
    
    // Заполняем случайным шумом
    for (let i = 0; i < buffer.length; i++) {
        // Генерируем случайный оттенок серого
        if (Math.random() < 0.5) {
             // 0xff000000 - это черный цвет (в hex формате ARGB)
             // Меняем прозрачность через рандом
             buffer[i] = 0xff000000 | (Math.random() * 255); 
        }
    }
    
    grainCtx.putImageData(imgData, 0, 0);
    
    // Зацикливаем анимацию
    requestAnimationFrame(drawGrain);
}

window.addEventListener('resize', resizeGrain);
resizeGrain();
drawGrain();