/* ============================================================
   AERO HOME™ — SCRIPTS
   Handles: sticky nav · mobile drawer · scroll animations
            counter animation · smooth scroll · aria
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   DOM REFS
───────────────────────────────────────── */
const navbar       = document.getElementById('navbar');
const hamburger    = document.getElementById('hamburger');
const mobileMenu   = document.getElementById('mobileMenu');
const mobileOverlay = document.getElementById('mobileOverlay');
const mobileLinks  = document.querySelectorAll('.mobile-link, .mobile-cta');


/* ─────────────────────────────────────────
   STICKY NAV — adds .scrolled after 80px
───────────────────────────────────────── */
function handleScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
}
window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll(); // run on load in case user refreshed mid-page


/* ─────────────────────────────────────────
   MOBILE MENU — open / close
───────────────────────────────────────── */
function openMenu() {
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
});

// Close when a link inside the menu is clicked
mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

// Close when overlay (backdrop) is clicked
mobileOverlay.addEventListener('click', closeMenu);

// Close on Escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
});


/* ─────────────────────────────────────────
   SCROLL-IN ANIMATIONS
   Adds .in-view to [data-animate] elements
   when they enter the viewport
───────────────────────────────────────── */
const animateObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                animateObserver.unobserve(entry.target); // fire once
            }
        });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('[data-animate]').forEach(el => {
    animateObserver.observe(el);
});


/* ─────────────────────────────────────────
   COUNTER ANIMATION
   Counts up from 0 to data-count value
   when the stats section enters view
───────────────────────────────────────── */
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function runCounter(el) {
    const target   = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1800; // ms
    const start    = performance.now();

    function tick(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        el.textContent = Math.round(easeOutCubic(progress) * target);
        if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                runCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.5 }
);

document.querySelectorAll('.stat-number[data-count]').forEach(el => {
    counterObserver.observe(el);
});


/* ─────────────────────────────────────────
   SMOOTH SCROLL — native anchor links
   Offsets by nav height so content isn't
   hidden behind the fixed bar
───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || !href) return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({ top, behavior: 'smooth' });
    });
});


/* ─────────────────────────────────────────
   ACTIVE NAV LINK HIGHLIGHT
   Highlights the nav link whose section
   is currently in view
───────────────────────────────────────── */
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navAnchors.forEach(a => a.classList.remove('active-link'));
                const matching = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
                if (matching) matching.classList.add('active-link');
            }
        });
    },
    {
        rootMargin: `-${navbar.offsetHeight + 10}px 0px -60% 0px`,
        threshold: 0
    }
);

sections.forEach(s => sectionObserver.observe(s));


/* ─────────────────────────────────────────
   GALLERY LIGHTBOX
───────────────────────────────────────── */
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxPrev  = document.getElementById('lightbox-prev');
const lightboxNext  = document.getElementById('lightbox-next');
const lightboxClose = document.getElementById('lightbox-close');

if (lightbox) {
    const galleryImgs = [...document.querySelectorAll('.gallery-cell:not(.gallery-empty) .gallery-img, .sp-gallery-cell img')];
    let currentIndex = 0;

    function openLightbox(index) {
        currentIndex = index;
        lightboxImg.src = galleryImgs[currentIndex].src;
        lightboxImg.alt = galleryImgs[currentIndex].alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateNavButtons();
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        lightboxImg.src = '';
    }

    function showPrev() { if (currentIndex > 0) openLightbox(currentIndex - 1); }
    function showNext() { if (currentIndex < galleryImgs.length - 1) openLightbox(currentIndex + 1); }

    function updateNavButtons() {
        lightboxPrev.style.display = currentIndex === 0 ? 'none' : 'flex';
        lightboxNext.style.display = currentIndex === galleryImgs.length - 1 ? 'none' : 'flex';
    }

    galleryImgs.forEach((img, i) => {
        const cell = img.closest('.gallery-cell, .sp-gallery-cell');
        if (!cell) return;
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('role', 'button');
        cell.setAttribute('aria-label', `View photo ${i + 1}`);
        cell.addEventListener('click', () => openLightbox(i));
        cell.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
        });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', showPrev);
    lightboxNext.addEventListener('click', showNext);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape')     closeLightbox();
        if (e.key === 'ArrowLeft')  showPrev();
        if (e.key === 'ArrowRight') showNext();
    });
}
