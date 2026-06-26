/**
 * MAXIME AUREL — COACH SPORTIF | script.js
 * Features:
 *  - Navbar scroll + hamburger menu
 *  - Scroll Reveal (Intersection Observer)
 *  - Animated counters (stats section)
 *  - FAQ accordion
 *  - Gallery filter
 *  - Back to top button
 *  - Active nav link on scroll
 *  - Footer year
 *  - Smooth scroll enhancement
 */

'use strict';

/* ============================================================
   UTILITY: Debounce
   ============================================================ */
function debounce(fn, delay = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ============================================================
   1. NAVBAR — scroll behaviour + hamburger
   ============================================================ */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  const allLinks  = navLinks ? navLinks.querySelectorAll('a') : [];

  if (!navbar) return;

  /* Sticky / scrolled state */
  function handleScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run on load

  if (!navLinks || !hamburger) return;

  /* Hamburger toggle */
  function openMenu() {
    navLinks.classList.add('open');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Fermer le menu');
    document.body.style.overflow = 'hidden'; // prevent body scroll
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  /* Close menu when a link is clicked */
  allLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* Close menu on Escape key */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  /* Close menu on outside click */
  document.addEventListener('click', (e) => {
    if (
      navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });
})();


/* ============================================================
   2. ACTIVE NAV LINK on scroll (Intersection Observer)
   ============================================================ */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const visibleSections = new Map();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        if (entry.isIntersecting) {
          visibleSections.set(id, entry.boundingClientRect.top);
        } else {
          visibleSections.delete(id);
        }
      });

      if (visibleSections.size === 0) return;

      const activeId = [...visibleSections.entries()]
        .sort((a, b) => a[1] - b[1])[0][0];

      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
      });
    },
    {
      rootMargin: '-20% 0px -75% 0px',
      threshold: 0
    }
  );

  sections.forEach(section => observer.observe(section));
})();


/* ============================================================
   3. SCROLL REVEAL (Intersection Observer)
   ============================================================ */
(function initScrollReveal() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  // Respect reduced motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    elements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // only animate once
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ============================================================
   4. ANIMATED COUNTERS (stats section)
   ============================================================ */
(function initCounters() {
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  if (!statNumbers.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1800; // ms
    const start    = performance.now();

    // Immediately show value if reduced motion
    if (prefersReduced) {
      el.textContent = target.toLocaleString('fr-FR');
      return;
    }

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutQuart(progress);
      const current  = Math.floor(eased * target);

      el.textContent = current.toLocaleString('fr-FR');

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString('fr-FR');
      }
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach(el => observer.observe(el));
})();


/* ============================================================
   5. FAQ ACCORDION
   ============================================================ */
(function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      // Close all other items
      faqItems.forEach(otherItem => {
        const otherBtn    = otherItem.querySelector('.faq-question');
        const otherAnswer = otherItem.querySelector('.faq-answer');
        if (otherBtn && otherAnswer && otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAnswer.hidden = true;
        }
      });

      // Toggle current item
      btn.setAttribute('aria-expanded', String(!isExpanded));
      answer.hidden = isExpanded;
    });

    /* Keyboard support: Enter / Space already handled natively on <button>
       Add support for arrow keys navigation between items */
    btn.addEventListener('keydown', (e) => {
      const buttons = [...document.querySelectorAll('.faq-question')];
      const index   = buttons.indexOf(btn);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        buttons[Math.min(index + 1, buttons.length - 1)]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        buttons[Math.max(index - 1, 0)]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        buttons[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        buttons[buttons.length - 1]?.focus();
      }
    });
  });
})();


/* ============================================================
   6. GALLERY FILTER
   ============================================================ */
(function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.gallery-filter');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!filterBtns.length || !galleryItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Update active button
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Filter items with a fade transition
      galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        const matches  = filter === 'all' || category === filter;

        if (matches) {
          item.classList.remove('hidden');
          // Trigger re-reveal animation
          item.style.animation = 'none';
          item.offsetHeight; // reflow
          item.style.animation = '';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
})();


/* ============================================================
   7. BACK TO TOP BUTTON
   ============================================================ */
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const SHOW_THRESHOLD = 400; // px

  function toggleVisibility() {
    if (window.scrollY > SHOW_THRESHOLD) {
      btn.hidden = false;
      // Small delay before showing opacity so transition fires
      requestAnimationFrame(() => btn.style.opacity = '1');
    } else {
      btn.style.opacity = '0';
      // Wait for transition before hiding
      setTimeout(() => {
        if (window.scrollY <= SHOW_THRESHOLD) btn.hidden = true;
      }, 300);
    }
  }

  window.addEventListener('scroll', debounce(toggleVisibility, 50), { passive: true });
  toggleVisibility();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   8. FOOTER — current year
   ============================================================ */
(function initYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();


/* ============================================================
   9. SMOOTH SCROLL for all anchor links
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
        10
      ) || 70;

      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ============================================================
   10. HERO — subtle parallax on scroll
   ============================================================ */
(function initHeroParallax() {
  const heroBg1 = document.querySelector('.hero-bg-circle--1');
  const heroBg2 = document.querySelector('.hero-bg-circle--2');
  const hero    = document.querySelector('.hero');

  if (!heroBg1 || !heroBg2 || !hero) return;

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function onScroll() {
    const scrolled = window.scrollY;
    const heroH    = hero.offsetHeight;
    if (scrolled > heroH) return;

    const rate = scrolled * 0.25;
    heroBg1.style.transform = `translateY(${rate}px)`;
    heroBg2.style.transform = `translateY(${-rate * 0.6}px)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ============================================================
   11. SERVICE CARDS — magnetic hover effect (subtle)
   ============================================================ */
(function initMagneticCards() {
  // Only on desktop/pointer devices
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = document.querySelectorAll('.service-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect    = card.getBoundingClientRect();
      const centerX = rect.left + rect.width  / 2;
      const centerY = rect.top  + rect.height / 2;
      const offsetX = (e.clientX - centerX) / rect.width  * 8;
      const offsetY = (e.clientY - centerY) / rect.height * 8;

      card.style.transform = `translateY(-6px) rotateY(${offsetX}deg) rotateX(${-offsetY}deg)`;
      card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform var(--duration-normal) var(--ease-out)';
    });
  });
})();


/* ============================================================
   12. LAZY LOADING — native enhancement
   ============================================================ */
(function initLazyLoading() {
  // Add loading="lazy" to any images without it
  document.querySelectorAll('img:not([loading])').forEach(img => {
    img.setAttribute('loading', 'lazy');
  });
})();


/* ============================================================
   13. GALLERY — keyboard navigation & accessibility
   ============================================================ */
(function initGalleryA11y() {
  const items = document.querySelectorAll('.gallery-item');

  items.forEach(item => {
    // Make items keyboard-focusable
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');

    // Show overlay on focus
    item.addEventListener('focus', () => {
      item.querySelector('.gallery-overlay')?.style.setProperty('opacity', '1');
    });

    item.addEventListener('blur', () => {
      item.querySelector('.gallery-overlay')?.style.setProperty('opacity', '');
    });
  });
})();
