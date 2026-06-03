const DEFAULT_CHANNELS = [
    { id: 1, title: "INSPIRATION", src: "videos/vdohnovenie.mp4" },
    { id: 2, title: "TVOY KHOD", src: "videos/tvoy-hod1.mp4" },
    { id: 3, title: "SOK SKFU", src: "videos/sok-skfu.mp4" },
    { id: 4, title: "SKFU MOSCOW", src: "videos/NCFU-Moscow.mp4" },
    { id: 5, title: "LSHZ PROJECT", src: "videos/lshz-project.mp4" },
    { id: 6, title: "MEDIUM MEDIA", src: "videos/mediummedia.mp4" },
    { id: 7, title: "MOTION DESIGN", src: "videos/motion.mp4" },
    { id: 8, title: "CONCEPT MIM 2026", src: "videos/concept_mim.mp4" },
    { id: 9, title: "DAMAGE CLUB", src: "videos/proj1.mp4" }
];

const CONFIG_PATH = "data/portfolio.json";

let channels = [...DEFAULT_CHANNELS];
let currentChannelIndex = -1;
let channelSwitchTimeout;
let staticNoiseTimeout;
let audioCtx = null;

const videoPlayer = document.getElementById("main-video");
const staticNoise = document.getElementById("tv-static");
const hugeChannelNum = document.getElementById("huge-channel-num");
const titleEl = document.getElementById("tv-title");
const muteBtn = document.getElementById("mute-btn");
const iconVolOn = document.getElementById("icon-vol-on");
const iconVolOff = document.getElementById("icon-vol-off");
const heroSection = document.getElementById("hero");
const projectsGrid = document.querySelector(".projects-grid");

function updateTimecode() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const frames = String(Math.floor(Math.random() * 99)).padStart(2, "0");
    const timeElement = document.getElementById("timecode");

    if (timeElement) {
        timeElement.textContent = `${hours}:${minutes}:${seconds}:${frames}`;
    }
}

function setupProjectReveal() {
    const items = document.querySelectorAll(".project-item");
    if (!items.length || !("IntersectionObserver" in window)) {
        items.forEach((item) => {
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    items.forEach((item) => {
        item.style.opacity = "0";
        item.style.transform = "translateY(20px)";
        item.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        observer.observe(item);
    });
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
}

function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playSwitchSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);

    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 1000;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start();
}

function triggerChannelSwitch(index) {
    if (!channels.length || !videoPlayer || !staticNoise || !hugeChannelNum || !titleEl) return;

    currentChannelIndex = index;
    const channel = channels[index];

    hugeChannelNum.textContent = String(channel.id).padStart(2, "0");
    titleEl.textContent = channel.title;
    staticNoise.classList.add("active");

    if (!videoPlayer.muted) {
        playSwitchSound();
    }

    clearTimeout(staticNoiseTimeout);
    staticNoiseTimeout = setTimeout(() => {
        staticNoise.classList.remove("active");
    }, 300);

    clearTimeout(channelSwitchTimeout);
    channelSwitchTimeout = setTimeout(() => {
        videoPlayer.src = channel.src;
        videoPlayer.load();

        const playPromise = videoPlayer.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Fast channel switching can interrupt playback; the next event will recover it.
            });
        }
    }, 150);
}

function setupHeroChannels() {
    if (!heroSection) return;

    heroSection.addEventListener("mousemove", (e) => {
        if (!channels.length) return;

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

function updateMuteIcon() {
    if (!videoPlayer || !iconVolOn || !iconVolOff) return;

    if (videoPlayer.muted) {
        iconVolOn.style.display = "none";
        iconVolOff.style.display = "block";
        iconVolOff.style.color = "#ff5f56";
        if (muteBtn) {
            muteBtn.setAttribute("aria-label", "Enable sound");
            muteBtn.setAttribute("aria-pressed", "false");
        }
        return;
    }

    iconVolOn.style.display = "block";
    iconVolOff.style.display = "none";
    iconVolOn.style.color = "#fff";
    if (muteBtn) {
        muteBtn.setAttribute("aria-label", "Mute sound");
        muteBtn.setAttribute("aria-pressed", "true");
    }

    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") ctx.resume();
}

function toggleMute() {
    if (!videoPlayer) return;
    videoPlayer.muted = !videoPlayer.muted;
    updateMuteIcon();
}

function updateTimeline() {
    const playhead = document.getElementById("timeline-playhead");
    const timelineContainer = document.getElementById("timeline-container");
    if (!playhead) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (scrollHeight <= 0) return;

    const scrollPercent = (scrollTop / scrollHeight) * 100;
    playhead.style.left = `${scrollPercent}%`;

    if (timelineContainer) {
        timelineContainer.setAttribute("aria-valuenow", Math.round(scrollPercent));
    }
}

function setupTimeline() {
    let scrollRafId = null;

    window.addEventListener("scroll", () => {
        if (scrollRafId) return;

        scrollRafId = requestAnimationFrame(() => {
            updateTimeline();
            scrollRafId = null;
        });
    }, { passive: true });
}

function normalizeChannels(configChannels) {
    if (!Array.isArray(configChannels) || !configChannels.length) {
        return [...DEFAULT_CHANNELS];
    }

    return configChannels
        .filter((channel) => channel && channel.title && channel.src)
        .map((channel, index) => ({
            id: channel.id || index + 1,
            title: channel.title,
            src: channel.src
        }));
}

function createProjectCard(project) {
    const link = document.createElement("a");
    link.href = project.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "project-item";

    const preview = document.createElement("div");
    preview.className = "project-preview";

    const image = document.createElement("img");
    image.src = project.image;
    image.alt = project.alt || project.title;
    image.loading = "lazy";

    const noise = document.createElement("div");
    noise.className = "noise-overlay";
    noise.setAttribute("aria-hidden", "true");

    const play = document.createElement("div");
    play.className = "play-icon";
    play.setAttribute("aria-hidden", "true");
    play.textContent = project.actionLabel || "PLAY_RAW";

    const info = document.createElement("div");
    info.className = "project-info";

    const title = document.createElement("h3");
    title.textContent = project.title;

    const category = document.createElement("span");
    category.textContent = project.category || "";

    preview.append(image, noise, play);
    info.append(title, category);
    link.append(preview, info);

    return link;
}

function renderSelectedWorks(projects) {
    if (!projectsGrid || !Array.isArray(projects) || !projects.length) return;

    projectsGrid.replaceChildren();
    projects
        .filter((project) => project && project.title && project.url && project.image)
        .forEach((project) => {
            projectsGrid.append(createProjectCard(project));
        });
}

async function loadPortfolioConfig() {
    try {
        const response = await fetch(`${CONFIG_PATH}?v=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`Config request failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.warn("Portfolio config was not loaded; using embedded fallback.", error);
        return null;
    }
}

async function applyPortfolioConfig() {
    const config = await loadPortfolioConfig();

    if (config) {
        channels = normalizeChannels(config.tvChannels);
        renderSelectedWorks(config.selectedWorks);
    }

    setupProjectReveal();
    triggerChannelSwitch(0);
}

document.addEventListener("DOMContentLoaded", () => {
    setInterval(updateTimecode, 40);
    updateTimecode();
    setupSmoothScroll();
    setupHeroChannels();
    setupTimeline();

    if (muteBtn) {
        muteBtn.addEventListener("click", toggleMute);
    }

    if (videoPlayer) {
        videoPlayer.muted = false;
        updateMuteIcon();

        applyPortfolioConfig().then(() => {
            const playPromise = videoPlayer.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    videoPlayer.muted = true;
                    updateMuteIcon();
                    videoPlayer.play();
                });
            }
        });
    } else {
        applyPortfolioConfig();
    }
});
