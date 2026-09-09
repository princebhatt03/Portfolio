/**
 * Shared site behaviour for index.html and portfolio-details.html.
 * Every block guards on the elements it needs, so one file serves both pages.
 */
(function () {
  'use strict';

  const select = (el, all = false) => {
    el = el.trim();
    return all ? [...document.querySelectorAll(el)] : document.querySelector(el);
  };

  const on = (type, el, listener, all = false) => {
    const selectEl = select(el, all);
    if (!selectEl) return;
    if (all) selectEl.forEach(e => e.addEventListener(type, listener));
    else selectEl.addEventListener(type, listener);
  };

  const onscroll = (el, listener) => el.addEventListener('scroll', listener);

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /**
   * Theme toggle.
   *
   * With no saved choice the site follows the OS via prefers-color-scheme;
   * clicking the toggle writes an explicit choice to localStorage, which the
   * pre-paint script in <head> re-applies on the next visit. Every storage
   * call is guarded — it throws outright in some privacy modes.
   */
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const label = document.getElementById('theme-toggle-label');
    const root = document.documentElement;

    const store = {
      get() {
        try {
          return localStorage.getItem('theme');
        } catch (e) {
          return null;
        }
      },
      set(v) {
        try {
          localStorage.setItem('theme', v);
        } catch (e) {
          /* private mode — the choice just won't persist */
        }
      },
    };

    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    const isDark = () => {
      const attr = root.getAttribute('data-theme');
      if (attr) return attr === 'dark';
      return systemDark.matches;
    };

    const syncLabel = () => {
      const dark = isDark();
      if (label) label.textContent = dark ? 'Light mode' : 'Dark mode';
      themeToggle.setAttribute(
        'aria-label',
        dark ? 'Switch to light theme' : 'Switch to dark theme'
      );
    };

    themeToggle.addEventListener('click', () => {
      const next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store.set(next);
      syncLabel();
    });

    // Follow the OS while no explicit choice has been made
    systemDark.addEventListener('change', () => {
      if (!store.get()) syncLabel();
    });

    syncLabel();
  }

  /**
   * Navbar links active state on scroll
   */
  const navbarlinks = select('#navbar .scrollto', true);
  const navbarlinksActive = () => {
    const position = window.scrollY + 200;
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return;
      const section = select(navbarlink.hash);
      if (!section) return;
      if (
        position >= section.offsetTop &&
        position <= section.offsetTop + section.offsetHeight
      ) {
        navbarlink.classList.add('active');
      } else {
        navbarlink.classList.remove('active');
      }
    });
  };
  window.addEventListener('load', navbarlinksActive);
  onscroll(document, navbarlinksActive);

  /**
   * Scrolls to an element, honouring a reduced-motion preference
   */
  const scrollto = el => {
    const target = select(el);
    if (!target) return;
    window.scrollTo({
      top: target.offsetTop,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  /**
   * Back to top button
   */
  const backtotop = select('.back-to-top');
  if (backtotop) {
    const toggleBacktotop = () => {
      backtotop.classList.toggle('active', window.scrollY > 100);
    };
    window.addEventListener('load', toggleBacktotop);
    onscroll(document, toggleBacktotop);
  }

  /**
   * Mobile nav toggle. The toggle is a <button>; the icon is the <i> inside it,
   * so the icon classes and the pressed state are handled separately.
   */
  const navToggle = select('.mobile-nav-toggle');
  const setNavOpen = open => {
    document.body.classList.toggle('mobile-nav-active', open);
    if (!navToggle) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute(
      'aria-label',
      open ? 'Close navigation menu' : 'Open navigation menu'
    );
    const icon = navToggle.querySelector('i');
    if (icon) {
      icon.classList.toggle('bi-list', !open);
      icon.classList.toggle('bi-x', open);
    }
  };
  if (navToggle) {
    navToggle.addEventListener('click', () =>
      setNavOpen(!document.body.classList.contains('mobile-nav-active'))
    );
    // Escape closes the mobile menu
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && document.body.classList.contains('mobile-nav-active')) {
        setNavOpen(false);
        navToggle.focus();
      }
    });
  }

  /**
   * Scroll with offset on links with the class .scrollto
   */
  on(
    'click',
    '.scrollto',
    function (e) {
      if (!select(this.hash)) return;
      e.preventDefault();
      if (document.body.classList.contains('mobile-nav-active')) setNavOpen(false);
      scrollto(this.hash);
    },
    true
  );

  /**
   * Scroll with offset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash && select(window.location.hash)) {
      scrollto(window.location.hash);
    }
  });

  /**
   * Hero type effect. Skipped entirely under reduced motion — the first
   * item is written out as static text instead.
   */
  const typed = select('.typed');
  if (typed && typed.getAttribute('data-typed-items')) {
    const items = typed.getAttribute('data-typed-items').split(',');
    if (prefersReducedMotion || typeof Typed === 'undefined') {
      typed.textContent = items[0].trim();
    } else {
      new Typed('.typed', {
        strings: items,
        loop: true,
        typeSpeed: 100,
        backSpeed: 50,
        backDelay: 2000,
      });
    }
  }

  /**
   * Age, computed from the date of birth so it never goes stale
   */
  const ageEl = document.getElementById('age');
  if (ageEl && ageEl.dataset.dob) {
    const dob = new Date(ageEl.dataset.dob);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const beforeBirthday =
      now.getMonth() < dob.getMonth() ||
      (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate());
    if (beforeBirthday) age--;
    ageEl.textContent = String(age);
  }

  /**
   * Resume viewer. The PDF <object> is only put in the DOM's flow when asked
   * for — browsers start downloading an embedded PDF immediately otherwise,
   * which would add ~100 KB to every page load for a panel most people
   * never open.
   */
  const resumeBtn = document.getElementById('resume-view');
  const resumeViewer = document.getElementById('resume-viewer');
  if (resumeBtn && resumeViewer) {
    const obj = resumeViewer.querySelector('object');
    const src = obj ? obj.getAttribute('data') : null;
    if (obj) obj.removeAttribute('data'); // don't fetch until opened

    resumeBtn.addEventListener('click', () => {
      const open = !resumeViewer.hidden;
      resumeViewer.hidden = open;
      resumeBtn.setAttribute('aria-expanded', String(!open));
      resumeBtn.textContent = open ? 'View resume' : 'Hide resume';
      if (!open && obj && !obj.getAttribute('data')) {
        obj.setAttribute('data', src);
      }
    });
  }

  /**
   * Portfolio isotope and filter
   */
  window.addEventListener('load', () => {
    const portfolioContainer = select('.portfolio-container');
    if (!portfolioContainer || typeof Isotope === 'undefined') return;

    const portfolioIsotope = new Isotope(portfolioContainer, {
      itemSelector: '.portfolio-item',
    });
    const portfolioFilters = select('#portfolio-flters li', true);

    on(
      'click',
      '#portfolio-flters li',
      function (e) {
        e.preventDefault();
        portfolioFilters.forEach(el => {
          el.classList.remove('filter-active');
          el.setAttribute('aria-pressed', 'false');
        });
        this.classList.add('filter-active');
        this.setAttribute('aria-pressed', 'true');

        portfolioIsotope.arrange({ filter: this.getAttribute('data-filter') });
        portfolioIsotope.on('arrangeComplete', () => {
          if (typeof AOS !== 'undefined') AOS.refresh();
        });
      },
      true
    );

    // Keyboard support: the filters are list items, not buttons
    on(
      'keydown',
      '#portfolio-flters li',
      function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      },
      true
    );
  });

  /**
   * Portfolio lightbox
   */
  if (typeof GLightbox !== 'undefined' && select('.portfolio-lightbox')) {
    GLightbox({ selector: '.portfolio-lightbox' });
  }

  /**
   * Project details slider
   */
  if (typeof Swiper !== 'undefined' && select('.portfolio-details-slider')) {
    new Swiper('.portfolio-details-slider', {
      speed: 400,
      loop: true,
      autoplay: prefersReducedMotion
        ? false
        : { delay: 5000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', type: 'bullets', clickable: true },
    });
  }

  /**
   * Skills animation
   */
  const skillsContent = select('.skills-content');
  if (skillsContent && typeof Waypoint !== 'undefined') {
    new Waypoint({
      element: skillsContent,
      offset: '80%',
      handler: function () {
        select('.progress .progress-bar', true).forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      },
    });
  }

  /**
   * Animation on scroll. Disabled under reduced motion so nothing is
   * left invisible waiting for an animation that never runs.
   */
  window.addEventListener('load', () => {
    if (typeof AOS === 'undefined') return;
    // The stylesheet leaves [data-aos] elements visible by default; this class
    // hands control to AOS. Without it, a failed AOS load would leave whole
    // sections at opacity 0 with no way back.
    if (!prefersReducedMotion) document.documentElement.classList.add('aos-ready');
    AOS.init({
      duration: 700,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
      offset: 40,
      disable: prefersReducedMotion,
    });

    if (prefersReducedMotion) return;

    // AOS records each element's position at init. Images finishing later, or
    // Isotope re-laying out the grid, move everything below them — and AOS
    // keeps firing against the stale offsets, which is how a section ends up
    // scrolled past but still at opacity 0.
    const refresh = () => AOS.refreshHard();
    setTimeout(refresh, 400);
    setTimeout(refresh, 1500);
    window.addEventListener('resize', () => setTimeout(refresh, 200));

    // Safety net: whatever AOS thinks, anything actually on screen gets
    // revealed. Nothing that scrolls into view can stay invisible.
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('aos-animate');
            io.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -5% 0px', threshold: 0.01 }
      );
      select('[data-aos]', true).forEach(el => io.observe(el));
    }
  });

  /**
   * Counters
   */
  if (typeof PureCounter !== 'undefined') new PureCounter();
})();

/* The preloader is gone — assets/js/skeleton.js owns loading state now. */
