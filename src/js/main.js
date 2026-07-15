/*
   main.js
   Vanilla JS, no dependencies.
   */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initStickyOffsets();
  initMegaMenus();
  initSearchOverlay();
  initStatCounters();
  initTestimonialSplide();
  initAdvisoryCarousel();
  initAccordions();
  initExpertForm();
  initArticleToc();
  initBackToTop();
  initContactModal();
});

/* ---- Mobile nav toggle ---- */
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    // Icon swap (hamburger <-> X) 
    // aria-expanded attribute;
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
}

/* ---- Mega menu dropdowns (click to open, click outside / Escape to close) ---- */
function initMegaMenus() {
  const items = document.querySelectorAll(".nav__item");

  items.forEach((item) => {
    const trigger = item.querySelector(".nav__link");
    const panel = item.querySelector(".mega-panel");
    if (!trigger || !panel) return;

    trigger.addEventListener("click", () => {
      const isOpen = panel.classList.contains("is-open");
      closeAllPanels();
      if (!isOpen) {
        panel.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

  function closeAllPanels() {
    document.querySelectorAll(".mega-panel").forEach((p) => p.classList.remove("is-open"));
    document.querySelectorAll(".nav__link").forEach((t) => t.setAttribute("aria-expanded", "false"));
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav__item")) closeAllPanels();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllPanels();
  });
}

/* ---- Animated stat counters — trigger once when scrolled into view ---- */
function initStatCounters() {
  const stats = document.querySelectorAll("[data-count-to]");
  if (!stats.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach((el) => observer.observe(el));

  function animateCount(el) {
    const target = parseInt(el.dataset.countTo, 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1200;
    const start = performance.now();

    // Respect reduced-motion preference: show the final value immediately.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = target + suffix;
      return;
    }

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
}

/* ---- Search overlay — slides down from the header, opened by the search icon ---- */
function initSearchOverlay() {
  const openers = document.querySelectorAll("[data-open-search]");
  const overlay = document.querySelector(".search-overlay");
  if (!overlay || !openers.length) return;

  const input = overlay.querySelector(".search-overlay__input");
  const closeBtn = overlay.querySelector("[data-close-search]");
  let lastFocused = null;

  function open() {
    lastFocused = document.activeElement;
    overlay.hidden = false;
    // Next frame so the transition runs from the hidden state, not instantly.
    requestAnimationFrame(() => overlay.classList.add("is-open"));
    openers.forEach((o) => o.setAttribute("aria-expanded", "true"));
    input?.focus();
  }

  function close() {
    overlay.classList.remove("is-open");
    openers.forEach((o) => o.setAttribute("aria-expanded", "false"));
    // Wait for the slide-up transition before hiding from the a11y tree.
    const hide = () => { overlay.hidden = true; overlay.removeEventListener("transitionend", hide); };
    overlay.addEventListener("transitionend", hide);
    lastFocused?.focus();
  }

  openers.forEach((btn) => btn.addEventListener("click", open));
  closeBtn?.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
  });
}

/* ---- Back-to-top button: reveal after scrolling, smooth-scroll up on click ---- */
function initBackToTop() {
  const btn = document.querySelector(".to-top");
  if (!btn) return;

  function onScroll() {
    const show = window.scrollY > 400;
    btn.hidden = false; // keep in DOM; visibility handled by class
    btn.classList.toggle("is-visible", show);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---- Expose sticky offsets as CSS vars ----     */
function initStickyOffsets() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const contactBar = document.querySelector(".contact-bar");

  function set() {
    const headerBottom = Math.max(0, header.getBoundingClientRect().bottom);
    document.documentElement.style.setProperty("--header-h", `${Math.round(headerBottom)}px`);


    let stack = headerBottom;
    if (contactBar && getComputedStyle(contactBar).display !== "none") {
      stack += contactBar.offsetHeight;
    }
    document.documentElement.style.setProperty("--stack-top", `${Math.round(stack)}px`);
  }
  set();
  window.addEventListener("scroll", set, { passive: true });
  window.addEventListener("resize", set);
}

/* ---- Expert-advice sidebar: collapsible <details> on mobile, always-open on desktop ---- */
function initExpertForm() {
  const wraps = document.querySelectorAll(".expert-form-wrap");
  if (!wraps.length) return;

  const mq = window.matchMedia("(min-width: 1024px)");

  function sync() {
    wraps.forEach((wrap) => {
      if (mq.matches) {
        // Desktop: force open and disable the toggle so the sticky card just shows.
        wrap.setAttribute("open", "");
      } else {
        // Mobile: collapse by default so the article content leads.
        wrap.removeAttribute("open");
      }
    });
  }

  sync();
  // Re-sync on breakpoint cross (addEventListener is supported on modern MediaQueryList).
  mq.addEventListener ? mq.addEventListener("change", sync) : mq.addListener(sync);

  // On desktop, prevent the summary click from collapsing the forced-open panel.
  wraps.forEach((wrap) => {
    const summary = wrap.querySelector(".expert-form-wrap__summary");
    summary?.addEventListener("click", (e) => {
      if (mq.matches) e.preventDefault();
    });
  });
}

/* ---- Article TOC: open on desktop, collapsed by default on mobile (stays toggleable) ---- */
function initArticleToc() {
  const tocs = document.querySelectorAll(".article-toc");
  if (!tocs.length) return;

  const mq = window.matchMedia("(min-width: 1024px)");
  let userToggled = false;

  function sync() {
    // Once the user has manually opened/closed
    if (userToggled) return;
    tocs.forEach((toc) => {
      if (mq.matches) toc.setAttribute("open", "");
      else toc.removeAttribute("open");
    });
  }

  sync();
  mq.addEventListener ? mq.addEventListener("change", sync) : mq.addListener(sync);

  tocs.forEach((toc) => {
    const summary = toc.querySelector(".article-toc__summary");
    summary?.addEventListener("click", () => { userToggled = true; });
    // Collapse the sticky TOC after tapping a link so it doesn't cover content.
    toc.querySelectorAll(".article-toc__list a").forEach((link) => {
      link.addEventListener("click", () => {
        if (!mq.matches) toc.removeAttribute("open");
      });
    });
  });
}

/* ---- Advisory carousel — Splide with arrows + dots (homepage) ---- */
function initAdvisoryCarousel() {
  const el = document.querySelector(".advisory-carousel");
  if (!el || typeof Splide === "undefined") return;

  new Splide(el, {
    type: "loop",
    perPage: 1,
    arrows: true,
    pagination: true,
    speed: 500,
  }).mount();
}

/* ---- Testimonial slider — Splide.js */
function initTestimonialSplide() {
  const el = document.querySelector(".testimonial-slider");
  if (!el || typeof Splide === "undefined") return;

  new Splide(el, {
    type: "loop",
    perPage: 1,
    arrows: false,
    pagination: true,
    autoplay: true,
    interval: 6000,
    pauseOnHover: true,
    speed: 500,
  }).mount();
}

/* ---- Accordion — collapsible  ---- */
function initAccordions() {
  document.querySelectorAll(".accordion").forEach((accordion) => {
    const items = accordion.querySelectorAll(".accordion__item");

    items.forEach((item) => {
      const trigger = item.querySelector(".accordion__trigger");
      const panel = item.querySelector(".accordion__panel");
      if (!trigger || !panel) return;

      trigger.addEventListener("click", () => {
        const isOpen = panel.classList.contains("is-open");
        trigger.setAttribute("aria-expanded", String(!isOpen));
        panel.classList.toggle("is-open", !isOpen);
      });
    });
  });
}

/* ---- Contact modal  ---- */
function initContactModal() {
  const openers = document.querySelectorAll("[data-open-modal]");
  const overlay = document.querySelector(".modal-overlay");
  if (!overlay) return;

  const closeBtn = overlay.querySelector(".modal__close");
  let lastFocused = null;

  openers.forEach((btn) => {
    btn.addEventListener("click", () => {
      lastFocused = document.activeElement;
      overlay.classList.add("is-open");
      closeBtn?.focus();
    });
  });

  function close() {
    overlay.classList.remove("is-open");
    lastFocused?.focus();
  }

  closeBtn?.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
  });
}
