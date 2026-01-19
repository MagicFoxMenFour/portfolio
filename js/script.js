// === FAQ Toggle ===
document.querySelectorAll('.faq-question').forEach(item => {
    item.addEventListener('click', () => {
        const parent = item.parentElement;
        const isOpen = parent.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(other => other.classList.remove('open'));
        if (!isOpen) {
            parent.classList.add('open');
        }
    });
});

// === Анимация появления элементов при прокрутке ===
const appearElements = document.querySelectorAll('[data-appear]');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

appearElements.forEach(el => { observer.observe(el); });


// === ОБНОВЛЕННАЯ ЛОГИКА ДЛЯ АДАПТИВНОЙ НАВИГАЦИИ ===
const nav = document.getElementById('main-nav');
const navToggle = document.querySelector('.nav-toggle');

if (nav && navToggle) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        nav.classList.toggle('mobile-open');
    });
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && nav.classList.contains('mobile-open')) {
            if (!nav.contains(e.target)) {
                nav.classList.remove('mobile-open');
            }
        }
    });
}

// === НОВОЕ: ПОДСВЕТКА АКТИВНОЙ ССЫЛКИ ===
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-links a");

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Удаляем класс active у всех ссылок
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Находим ссылку, которая ведет на эту секцию
            const id = entry.target.getAttribute('id');
            // Ищем ссылку с href="#id"
            const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
            
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}, { 
    threshold: 0.3 // Срабатывает, когда 30% секции видно на экране
});

sections.forEach(section => {
    navObserver.observe(section);
});
