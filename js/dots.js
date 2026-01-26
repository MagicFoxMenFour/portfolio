const canvas = document.getElementById('dotsCanvas');
const ctx = canvas.getContext('2d');

let dots = [];
const mouse = { x: null, y: null };

// НАСТРОЙКИ
const DOT_COLOR = '#e00000'; // Цвет точек (светло-серый)
const DOT_SIZE = 1;        // Размер точек
const SPACING = 35;          // Расстояние между точками
const MOUSE_RADIUS = 50;    // Радиус реакции на мышь
const REPEL_FORCE = 0.5;     // Сила отталкивания (чем больше, тем сильнее разлетаются)

// Настройка размера Canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initDots();
}

// Создание сетки точек
class Dot {
    constructor(x, y) {
        this.baseX = x;       // Исходная позиция X
        this.baseY = y;       // Исходная позиция Y
        this.x = x;           // Текущая позиция X
        this.y = y;           // Текущая позиция Y
        this.density = (Math.random() * 10) + 5; // Разный вес для разной скорости
    }

    draw() {
        ctx.fillStyle = DOT_COLOR;
        ctx.beginPath();
        ctx.arc(this.x, this.y, DOT_SIZE, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        // Рассчитываем расстояние до мыши
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        // Физика отталкивания
        // Если мышь рядом, точка убегает
        if (distance < MOUSE_RADIUS) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
            
            // Направление движения (от мыши)
            const directionX = forceDirectionX * force * this.density * REPEL_FORCE;
            const directionY = forceDirectionY * force * this.density * REPEL_FORCE;

            this.x -= directionX * 5; // 5 - множитель скорости
            this.y -= directionY * 5;
        } else {
            // Если мышь далеко, точка плавно возвращается на место
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 10; // Скорость возврата (чем больше число, тем медленнее)
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 10;
            }
        }
    }
}

function initDots() {
    dots = [];
    // Создаем сетку
    for (let y = 0; y < canvas.height; y += SPACING) {
        for (let x = 0; x < canvas.width; x += SPACING) {
            dots.push(new Dot(x, y));
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < dots.length; i++) {
        dots[i].draw();
        dots[i].update();
    }
    requestAnimationFrame(animate);
}

// Слушатели событий
window.addEventListener('resize', resizeCanvas);

// Отслеживание мыши
window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Убираем эффект, когда мышь ушла с экрана
window.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
});

// Запуск
resizeCanvas();
animate();