document.addEventListener('DOMContentLoaded', () => {

    // ── 1. Navbar Scroll Effect & Active Link Highlighter ──────────────────────
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 30);

        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href').includes(current));
        });
    }, { passive: true });

    // ── 2. Hamburger Menu (mobile) ─────────────────────────────────────────────
    const hamburger = document.getElementById('hamburger');
    const navLinksContainer = document.getElementById('navLinks');

    if (hamburger && navLinksContainer) {
        hamburger.addEventListener('click', () => {
            const isOpen = navLinksContainer.classList.toggle('open');
            hamburger.classList.toggle('open', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close menu when a link is clicked
        navLinksContainer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinksContainer.classList.remove('open');
                hamburger.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // ── 3. Intersection Observer for Blur-Reveals & Video Playback ─────────────
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                const video = entry.target.querySelector('video') ||
                    (entry.target.tagName === 'VIDEO' ? entry.target : null);
                if (video) video.play().catch(() => {});
            } else {
                const video = entry.target.querySelector('video') ||
                    (entry.target.tagName === 'VIDEO' ? entry.target : null);
                if (video) video.pause();
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

    revealElements.forEach(el => revealOnScroll.observe(el));

    // ── 4. Hero Carousel (with dots) ───────────────────────────────────────────
    const track = document.getElementById('heroCarouselTrack');
    if (track) {
        const slides = Array.from(track.children);
        const nextBtn = document.getElementById('carouselNext');
        const prevBtn = document.getElementById('carouselPrev');
        const dotsContainer = document.getElementById('carouselDots');
        let currentIndex = 0;
        let autoTimer = null;

        // Build dots
        const dots = slides.map((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dot.addEventListener('click', () => moveToSlide(i));
            dotsContainer.appendChild(dot);
            return dot;
        });

        function updateDots(index) {
            dots.forEach((d, i) => d.classList.toggle('active', i === index));
        }

        function moveToSlide(index) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            track.style.transform = `translateX(-${index * 100}%)`;
            currentIndex = index;
            updateDots(currentIndex);
        }

        function startAuto() {
            autoTimer = setInterval(() => moveToSlide(currentIndex + 1), 4000);
        }

        function resetAuto() {
            clearInterval(autoTimer);
            startAuto();
        }

        if (nextBtn && prevBtn) {
            nextBtn.addEventListener('click', () => { moveToSlide(currentIndex + 1); resetAuto(); });
            prevBtn.addEventListener('click', () => { moveToSlide(currentIndex - 1); resetAuto(); });
        }

        // Touch / swipe support
        let touchStartX = 0;
        track.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', e => {
            const diff = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(diff) > 40) {
                moveToSlide(diff < 0 ? currentIndex + 1 : currentIndex - 1);
                resetAuto();
            }
        }, { passive: true });

        startAuto();
    }

});
