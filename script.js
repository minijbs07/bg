document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect & Active Link Highlighter
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        // Navbar blur toggle
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active Link Highlighting
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    }, { passive: true });

    // 2. Intersection Observer for Blur-Reveals & Video Playback
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                const video = entry.target.querySelector('video') || (entry.target.tagName === 'VIDEO' ? entry.target : null);
                if (video) { video.play().catch(() => { }); }
            } else {
                const video = entry.target.querySelector('video') || (entry.target.tagName === 'VIDEO' ? entry.target : null);
                if (video) { video.pause(); }
            }
        });
    }, revealOptions);

    revealElements.forEach(el => revealOnScroll.observe(el));

    // 3. Hero Carousel
    const track = document.getElementById('heroCarouselTrack');
    if (track) {
        const slides = Array.from(track.children);
        const nextBtn = document.getElementById('carouselNext');
        const prevBtn = document.getElementById('carouselPrev');
        let currentIndex = 0;

        function moveToSlide(index) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            track.style.transform = `translateX(-${index * 100}%)`;
            currentIndex = index;
        }

        if (nextBtn && prevBtn) {
            nextBtn.addEventListener('click', () => moveToSlide(currentIndex + 1));
            prevBtn.addEventListener('click', () => moveToSlide(currentIndex - 1));
        }

        // Optional swipe support for mobile
        let touchstartX = 0;
        let touchendX = 0;
        track.addEventListener('touchstart', e => { touchstartX = e.changedTouches[0].screenX; });
        track.addEventListener('touchend', e => {
            touchendX = e.changedTouches[0].screenX;
            if (touchendX < touchstartX - 50) moveToSlide(currentIndex + 1);
            if (touchendX > touchstartX + 50) moveToSlide(currentIndex - 1);
        });
    }
});
