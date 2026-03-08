// ── Web Haptics helper ──────────────────────────────────────────────────────
// web-haptics library loaded via CDN. Falls back silently if not supported.
function haptic(type) {
    try {
        if (window.WebHaptics) {
            if (type === 'light')  window.WebHaptics.light();
            else if (type === 'medium') window.WebHaptics.medium();
            else if (type === 'heavy')  window.WebHaptics.heavy();
            else window.WebHaptics.light();
        } else if (navigator.vibrate) {
            // Fallback: vibration API on Android
            const ms = type === 'light' ? 10 : type === 'medium' ? 20 : 40;
            navigator.vibrate(ms);
        }
    } catch(e) {}
}

// ── Mobile menu: global functions called by inline onclick (instant, 0ms delay) ──
let menuOpen = false;

function toggleMenu() {
    menuOpen ? closeMenu() : openMenu();
}

function openMenu() {
    menuOpen = true;
    const menu = document.getElementById('mobileMenu');
    const btn  = document.getElementById('hamburger');
    if (!menu || !btn) return;
    menu.classList.add('open');
    btn.classList.add('open');
    // Prevent body scroll while menu is open
    document.body.style.overflow = 'hidden';
    haptic('medium');
}

function closeMenu() {
    menuOpen = false;
    const menu = document.getElementById('mobileMenu');
    const btn  = document.getElementById('hamburger');
    if (!menu || !btn) return;
    menu.classList.remove('open');
    btn.classList.remove('open');
    document.body.style.overflow = '';
    haptic('light');
}

document.addEventListener('DOMContentLoaded', () => {

    // ── 1. Navbar scroll effect & active link ─────────────────────────────────
    const navbar   = document.getElementById('navbar');
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 30);

        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 200) {
                current = section.getAttribute('id') || '';
            }
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href').includes(current));
        });
    }, { passive: true });

    // ── 2. Intersection Observer for reveal animations ────────────────────────
    const revealEls = document.querySelectorAll('.reveal');
    const observer  = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                const video = entry.target.querySelector('video')
                           || (entry.target.tagName === 'VIDEO' ? entry.target : null);
                if (video) video.play().catch(() => {});
            } else {
                const video = entry.target.querySelector('video')
                           || (entry.target.tagName === 'VIDEO' ? entry.target : null);
                if (video) video.pause();
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

    revealEls.forEach(el => observer.observe(el));

    // ── 3. Hero Carousel with dots & haptics ──────────────────────────────────
    const track    = document.getElementById('heroCarouselTrack');
    const dotsWrap = document.getElementById('carouselDots');

    if (track) {
        const slides   = Array.from(track.children);
        const nextBtn  = document.getElementById('carouselNext');
        const prevBtn  = document.getElementById('carouselPrev');
        let current    = 0;
        let autoTimer  = null;

        // Build dots
        if (dotsWrap) {
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', `Slide ${i + 1}`);
                dot.addEventListener('click', () => { moveTo(i); resetAuto(); haptic('light'); });
                dotsWrap.appendChild(dot);
            });
        }

        function updateDots(index) {
            if (!dotsWrap) return;
            dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
                d.classList.toggle('active', i === index);
            });
        }

        function moveTo(index) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            track.style.transform = `translateX(-${index * 100}%)`;
            current = index;
            updateDots(current);
        }

        function resetAuto() {
            clearInterval(autoTimer);
            autoTimer = setInterval(() => moveTo(current + 1), 4000);
        }

        if (nextBtn) nextBtn.addEventListener('click', () => { moveTo(current + 1); resetAuto(); haptic('light'); });
        if (prevBtn) prevBtn.addEventListener('click', () => { moveTo(current - 1); resetAuto(); haptic('light'); });

        // Touch/swipe support
        let touchStartX = 0;
        track.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        track.addEventListener('touchend', e => {
            const diff = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(diff) > 40) {
                moveTo(diff < 0 ? current + 1 : current - 1);
                resetAuto();
                haptic('light');
            }
        }, { passive: true });

        // Start autoplay
        resetAuto();
    }

    // ── 4. Haptics on data-haptic elements ────────────────────────────────────
    document.querySelectorAll('[data-haptic]').forEach(el => {
        el.addEventListener('pointerdown', () => {
            haptic(el.dataset.haptic || 'light');
        }, { passive: true });
    });

    // ── 5. Close mobile menu when clicking outside ────────────────────────────
    document.getElementById('mobileMenu')?.addEventListener('click', (e) => {
        // Close if clicking the backdrop (not the inner links)
        if (e.target === document.getElementById('mobileMenu')) closeMenu();
    });

    // ── 6. Close mobile menu on ESC ───────────────────────────────────────────
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuOpen) closeMenu();
    });

});
