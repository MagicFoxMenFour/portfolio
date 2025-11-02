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
    // Логика для десктопного скролла
    window.addEventListener('scroll', () => {
        // Эта логика будет работать только на экранах шире 768px из-за CSS
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Логика для клика по бургеру на мобильных устройствах
    navToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Предотвращаем закрытие меню при клике на саму кнопку
        nav.classList.toggle('mobile-open');
    });
    
    // Закрытие мобильного меню при клике вне его
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && nav.classList.contains('mobile-open')) {
            // Проверяем, что клик был не внутри nav
            if (!nav.contains(e.target)) {
                nav.classList.remove('mobile-open');
            }
        }
    });
}