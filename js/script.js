// === TIMECODE UPDATE (Для HUD) ===
function updateTimecode() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const frames = String(Math.floor(Math.random() * 99)).padStart(2, '0'); // Фейковые кадры
    
    const timeElement = document.getElementById('timecode');
    if(timeElement) {
        timeElement.textContent = `${hours}:${minutes}:${seconds}:${frames}`;
    }
}
setInterval(updateTimecode, 40); // Обновление каждые 40мс (как 25fps)

// === GLITCH EFFECT ON SCROLL (Optional) ===
const items = document.querySelectorAll('.grid-item, .project-item');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

// Изначально скрываем элементы для анимации появления
items.forEach(item => {
    item.style.opacity = 0;
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(item);
});

// === SMOOTH SCROLL FOR ANCHORS ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// === TV CHANNEL LOGIC ===

// 1. База данных каналов
// База данных каналов (9 штук)
const channels =[
    {
        id: 1,
        title: "INSPIRATION",
        desc: "CREATIVE REELS / VERTICAL",
        src: "videos/vdohnovenie.mp4"
    },
    {
        id: 2,
        title: "TVOY KHOD",
        desc: "EVENT HIGHLIGHT / 2025",
        src: "videos/tvoy-hod1.mp4"
    },
    {
        id: 3,
        title: "SOK SKFU",
        desc: "PROMO CAMPAIGN",
        src: "videos/sok-skfu.mp4"
    },
    {
        id: 4,
        title: "SKFU MOSCOW",
        desc: "DOCUMENTARY / VLOG",
        src: "videos/NCFU-Moscow.mp4"
    },
    {
        id: 5,
        title: "LSHZ PROJECT",
        desc: "REPORTAGE / MEDIA",
        src: "videos/lshz-project.mp4"
    },
    {
        id: 6,
        title: "MEDIUM MEDIA",
        desc: "COMMERCIAL AD",
        src: "videos/mediummedia.mp4"
    },
    {
        id: 7,
        title: "MOTION DESIGN",
        desc: "3D / VFX / BLENDER",
        src: "videos/motion.mp4"
    },
    {
        id: 8,
        title: "CONCEPT MIM 2026",
        desc: "ART DIRECTION / REELS",
        src: "videos/concept_mim.mp4"
    },
    {
        id: 9,
        title: "DAMAGE CLUB",
        desc: "NIGHTLIFE / NEON",
        src: "videos/proj1.mp4"
    }
];

// === TV CHANNEL LOGIC (MOUSE CONTROL & SOUNDS) ===

const videoPlayer = document.getElementById('main-video');
const staticNoise = document.getElementById('tv-static');
const hugeChannelNum = document.getElementById('huge-channel-num');
const titleEl = document.getElementById('tv-title');
const muteBtn = document.getElementById('mute-btn');
const iconVolOn = document.getElementById('icon-vol-on');
const iconVolOff = document.getElementById('icon-vol-off');
const heroSection = document.getElementById('hero');

let currentChannelIndex = -1; // Начинаем с -1, чтобы загрузка сработала 100%
let channelSwitchTimeout;
let staticNoiseTimeout; // Отдельный таймер для отключения шума!

// === ГЕНЕРАТОР ЗВУКА (Web Audio API) ===
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playSwitchSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);

    const bufferSize = audioCtx.sampleRate * 0.2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1000;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start();
}

// === ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ПО МЫШКЕ ===
if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const zoneWidth = rect.width / channels.length;
        
        let targetIndex = Math.floor(mouseX / zoneWidth);
        if (targetIndex < 0) targetIndex = 0;
        if (targetIndex >= channels.length) targetIndex = channels.length - 1;

        if (targetIndex !== currentChannelIndex) {
            triggerChannelSwitch(targetIndex);
        }
    });
}

function triggerChannelSwitch(index) {
    currentChannelIndex = index;
    const channel = channels[index];

    // 1. Моментальный визуал
    hugeChannelNum.textContent = String(channel.id).padStart(2, '0');
    titleEl.textContent = channel.title;
    
    // 2. Включаем шум
    staticNoise.classList.add('active');

    // Воспроизводим звук
    if (!videoPlayer.muted) {
        playSwitchSound();
    }

    // 3. ЖЕСТКО ВЫКЛЮЧАЕМ ШУМ (Гарантия от бесконечного шума)
    clearTimeout(staticNoiseTimeout);
    staticNoiseTimeout = setTimeout(() => {
        staticNoise.classList.remove('active');
    }, 300); // Ровно через 300мс шум исчезнет 100%

    // 4. Загрузка видео
    clearTimeout(channelSwitchTimeout);
    channelSwitchTimeout = setTimeout(() => {
        videoPlayer.src = channel.src;
        videoPlayer.load();
        
        const playPromise = videoPlayer.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Игнорируем ошибку прерывания, это нормально при быстром свайпе
            });
        }
    }, 150);
}

// === УПРАВЛЕНИЕ ЗВУКОМ И ИКОНКАМИ ===
function updateMuteIcon() {
    if (videoPlayer.muted) {
        iconVolOn.style.display = 'none';
        iconVolOff.style.display = 'block';
        iconVolOff.style.color = '#ff5f56';
    } else {
        iconVolOn.style.display = 'block';
        iconVolOff.style.display = 'none';
        iconVolOn.style.color = '#fff';
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }
}

function toggleMute() {
    videoPlayer.muted = !videoPlayer.muted;
    updateMuteIcon();
}

// === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ===
document.addEventListener('DOMContentLoaded', () => {
    // 1. Попытка включить звук
    videoPlayer.muted = false;
    updateMuteIcon();

    // 2. ВКЛЮЧАЕМ 6-Й КАНАЛ ПО УМОЛЧАНИЮ (Индекс массива: 5)
    triggerChannelSwitch(5);

    // 3. Обход блокировки звука браузером
    const playPromise = videoPlayer.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Автозапуск звука заблокирован. Запускаем без звука.");
            videoPlayer.muted = true;
            updateMuteIcon();
            videoPlayer.play();
        });
    }
});

// === ЛОГИКА ТАЙМЛАЙНА (СКРОЛЛ) ===
window.addEventListener('scroll', () => {
    const playhead = document.getElementById('timeline-playhead');
    if (playhead) {
        // Высчитываем процент прокрутки
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        
        // Двигаем красный ползунок
        playhead.style.left = scrollPercent + '%';
    }
});
// === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ===
document.addEventListener('DOMContentLoaded', () => {
    // Пытаемся запустить со ЗВУКОМ по умолчанию
    videoPlayer.muted = false;
    updateMuteIcon();

    // Загружаем первый канал
    const channel = channels[0];
    videoPlayer.src = channel.src;
    hugeChannelNum.textContent = "01";
    titleEl.textContent = channel.title;

    const playPromise = videoPlayer.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Браузер заблокировал автовоспроизведение со звуком. Запускаем без звука.");
            // Если браузер заблокировал звук -> включаем Mute и меняем иконку
            videoPlayer.muted = true;
            updateMuteIcon();
            videoPlayer.play(); // Теперь запустится без звука
        });
    }
});