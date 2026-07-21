/*
   main.js
   */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initStickyOffsets();
  initMegaMenus();
  initSearchOverlay();
  initStatCounters();
  initTestimonialSplide();
  initAdvisoryCarousel();
  initMobileSliders();
  initAccordions();
  initTabs();
  initDropdowns();
  initExpertForm();
  initArticleToc();
  initBackToTop();
  initModals();
  initPromoPopup();
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
   
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
}

/* ---- Mega menu dropdowns  ---- */
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

/* ---- Animated stat counters ---- */
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

/* ---- Search overlay — slides down ---- */
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
    
    requestAnimationFrame(() => overlay.classList.add("is-open"));
    openers.forEach((o) => o.setAttribute("aria-expanded", "true"));
    input?.focus();
  }

  function close() {
    overlay.classList.remove("is-open");
    openers.forEach((o) => o.setAttribute("aria-expanded", "false"));
   
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

/* ---- Back-to-top button: smooth-scroll up on click ---- */
function initBackToTop() {
  const btn = document.querySelector(".to-top");
  if (!btn) return;

  function onScroll() {
    const show = window.scrollY > 400;
    btn.hidden = false; 
    btn.classList.toggle("is-visible", show);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---- Expose sticky offsets as CSS ----     */
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

/* ---- Expert-advice sidebar: collapsible ---- */
function initExpertForm() {
  const wraps = document.querySelectorAll(".expert-form-wrap");
  if (!wraps.length) return;

  const mq = window.matchMedia("(min-width: 1024px)");

  function sync() {
    wraps.forEach((wrap) => {
      if (mq.matches) {
        
        wrap.setAttribute("open", "");
      } else {
        
        wrap.removeAttribute("open");
      }
    });
  }

  sync();

  mq.addEventListener ? mq.addEventListener("change", sync) : mq.addListener(sync);

  // On desktop, prevent the summary click from collapsing the forced-open panel.
  wraps.forEach((wrap) => {
    const summary = wrap.querySelector(".expert-form-wrap__summary");
    summary?.addEventListener("click", (e) => {
      if (mq.matches) e.preventDefault();
    });
  });
}

/* ---- Article TOC: open on desktop, collapsed  ---- */
function initArticleToc() {
  const tocs = document.querySelectorAll(".article-toc");
  if (!tocs.length) return;

  const mq = window.matchMedia("(min-width: 1024px)");
  let userToggled = false;

  function sync() {
    // manually opened/closed
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
// function initContactModal() {
//   const openers = document.querySelectorAll("[data-open-modal]");
//   const overlay = document.querySelector(".modal-overlay");
//   if (!overlay) return;

//   const closeBtn = overlay.querySelector(".modal__close");
//   let lastFocused = null;

//   openers.forEach((btn) => {
//     btn.addEventListener("click", () => {
//       lastFocused = document.activeElement;
//       overlay.classList.add("is-open");
//       closeBtn?.focus();
//     });
//   });

//   function close() {
//     overlay.classList.remove("is-open");
//     lastFocused?.focus();
//   }

//   closeBtn?.addEventListener("click", close);
//   overlay.addEventListener("click", (e) => {
//     if (e.target === overlay) close();
//   });
//   document.addEventListener("keydown", (e) => {
//     if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
//   });
// }

function initModals() {
  const overlays = document.querySelectorAll(".modal-overlay");
  if (!overlays.length) return;

  
  const lastFocused = new WeakMap();

  function open(overlay, trigger) {
    if (!overlay) return;
    lastFocused.set(overlay, trigger || document.activeElement);
    overlay.classList.add("is-open");
    // Prefer the close button; fall back to the first focusable control.
    const target = overlay.querySelector("[data-close-modal], .modal__close") ||
                   overlay.querySelector("input, select, textarea, button, a[href]");
    target?.focus();
  }

  function close(overlay) {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    lastFocused.get(overlay)?.focus();
    lastFocused.delete(overlay);
  }


 
  window.Modals = {
    open(id) { open(id ? document.getElementById(id) : overlays[0]); },
    close(id) { close(id ? document.getElementById(id) : overlays[0]); },
  };

  document.querySelectorAll("[data-open-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-open-modal");
      open(id ? document.getElementById(id) : overlays[0], btn);
    });
  });

  overlays.forEach((overlay) => {
    overlay.querySelectorAll("[data-close-modal], .modal__close").forEach((btn) => {
      btn.addEventListener("click", () => close(overlay));
    });

    // Backdrop click — only when the click lands on the overlay itself.
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close(overlay);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = Array.from(overlays).filter((o) => o.classList.contains("is-open"));
    close(open[open.length - 1]); // topmost only
  });
}

/* ---- Tabs —  ----   */
function initTabs() {
  document.querySelectorAll(".tabs").forEach((tabs) => {
    const tabList = tabs.querySelector('[role="tablist"]');
    if (!tabList) return;

    const tabButtons = Array.from(tabList.querySelectorAll('[role="tab"]'));
    if (!tabButtons.length) return;

    const noteEl = tabs.querySelector("[data-contact-note]");
    const contextEl = tabs.querySelector("[data-contact-context]");
    const typeEl = tabs.querySelector("[data-contact-type]");

    function select(tab) {
      tabButtons.forEach((btn) => {
        const selected = btn === tab;
        btn.setAttribute("aria-selected", String(selected));
        btn.setAttribute("tabindex", selected ? "0" : "-1");
      });

      // Panels
      const activeId = tab.getAttribute("aria-controls");
      const panelIds = new Set(tabButtons.map((b) => b.getAttribute("aria-controls")));
      panelIds.forEach((id) => {
        const panel = document.getElementById(id);
        if (panel) panel.hidden = id !== activeId;
      });

      const panel = document.getElementById(activeId);
      if (panel) panel.setAttribute("aria-labelledby", tab.id);

    
      if (noteEl && tab.dataset.note) noteEl.innerHTML = tab.dataset.note;
      if (contextEl && tab.dataset.context) contextEl.textContent = tab.dataset.context;
      if (typeEl && tab.dataset.context) typeEl.value = tab.dataset.context;
    }

    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => select(btn));
    });

    tabList.addEventListener("keydown", (e) => {
      const i = tabButtons.indexOf(document.activeElement);
      if (i === -1) return;

      let next = null;
      if (e.key === "ArrowRight") next = tabButtons[(i + 1) % tabButtons.length];
      else if (e.key === "ArrowLeft") next = tabButtons[(i - 1 + tabButtons.length) % tabButtons.length];
      else if (e.key === "Home") next = tabButtons[0];
      else if (e.key === "End") next = tabButtons[tabButtons.length - 1];
      if (!next) return;

      e.preventDefault();
      select(next);
      next.focus();
    });

    const initial = tabButtons.find((b) => b.getAttribute("aria-selected") === "true") || tabButtons[0];
    select(initial);
  });
}

/* ---- Promo popup  */
function initPromoPopup() {
  const popup = document.querySelector("[data-promo-popup]");
  if (!popup || !window.Modals) return;

  const id = popup.id;
  const KEY = `promoSeen:${id || "default"}`;

 
  try {
    if (sessionStorage.getItem(KEY)) return;
  } catch (e) {
    
  }

  const delay = Number(popup.dataset.promoDelay) || 20000;
  const scrollPct = Number(popup.dataset.promoScroll) || 60;

  
  const firstSection = document.querySelector("main > section") || document.querySelector("main");

  let fired = false;
  let timer = null;

  function markSeen() {
    try { sessionStorage.setItem(KEY, "1"); } catch (e) { /* ignore */ }
  }

  function fire() {
    if (fired) return;
    fired = true;
    clearTimeout(timer);
    window.removeEventListener("scroll", onScroll);
    window.Modals.open(id);
  }

  function onScroll() {
    if (!firstSection) return;
    const rect = firstSection.getBoundingClientRect();
    const height = rect.height || 1;
    
    const progress = Math.min(1, Math.max(0, -rect.top / height)) * 100;
    if (progress >= scrollPct) fire();
  }

  timer = setTimeout(fire, delay);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); 

  // Any close path marks.
  popup.addEventListener("click", (e) => {
    if (e.target === popup || e.target.closest("[data-close-modal], .modal__close")) markSeen();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup.classList.contains("is-open")) markSeen();
  });
}

function initMobileSliders() {
  const els = document.querySelectorAll("[data-mobile-slider]");
  if (!els.length || typeof Splide === "undefined") return;

  els.forEach((el) => {
    const breakpoint = Number(el.dataset.sliderBreakpoint) || 1000;
    const peek = el.dataset.sliderPeek || "";
    const perPage = Number(el.dataset.sliderPerpage) || 1;

    new Splide(el, {
      mediaQuery: "min",
      perPage,
      gap: "1rem",
      arrows: false,
      pagination: true,
      padding: { right: peek }, 
      breakpoints: {
        [breakpoint]: { destroy: true }, 
      },
    }).mount();
  });
}

function initAdvisoryCarousel() {
  const el = document.querySelector(".advisory-cards-slider");
  if (!el || typeof Splide === "undefined") return;

  new Splide(el, {
    type: "loop",
    perPage: 1,
    arrows: true,
    pagination: true,
    speed: 500,
  }).mount();
}

/* ---- Testimonial slider ---- */
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

function initDropdowns() {
  const dropdowns = document.querySelectorAll("[data-dropdown]");
  if (!dropdowns.length) return;

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  dropdowns.forEach((dd) => {
    const trigger = dd.querySelector(".dropdown__trigger");
    const menu = dd.querySelector(".dropdown__menu");
    if (!trigger || !menu) return;

    const mode = dd.dataset.dropdownMode || "nav";
    const items = Array.from(menu.querySelectorAll(".dropdown__item"));

    function open() {
      dd.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    }
    function close() {
      dd.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    }
    function toggle() {
      dd.classList.contains("is-open") ? close() : open();
    }

    // Click/tap
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      toggle();
    });

    // Select mode:
    if (mode === "select") {
      const label = trigger.querySelector(".dropdown__label");
      items.forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          if (label) label.textContent = (item.textContent || "").trim();
          dd.dataset.dropdownValue = item.dataset.value || (item.textContent || "").trim();
          items.forEach((i) => i.setAttribute("aria-current", String(i === item)));
          close();
          trigger.focus();
        });
      });
    }

    // Keyboard: open move 
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
        items[0]?.focus();
      }
    });

    menu.addEventListener("keydown", (e) => {
      const i = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length]?.focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus(); }
      else if (e.key === "Home") { e.preventDefault(); items[0]?.focus(); }
      else if (e.key === "End") { e.preventDefault(); items[items.length - 1]?.focus(); }
      else if (e.key === "Escape") { close(); trigger.focus(); }
    });

    // Click outside closes
    document.addEventListener("click", (e) => {
      if (!dd.contains(e.target)) close();
    });
    dd.addEventListener("mouseleave", () => {
      if (finePointer.matches) close();
    });
  });
}