/*
   main.js
   */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initStickyOffsets();
  initMegaMenus();
  initMultilevelMenus();
  initSearchOverlay();
  initSearchSuggest();
  initStatCounters();
  initTestimonialSplide();
  initGuideSliders();
  initFeatureToggle();
  initAdvisoryCarousel();
  initMobileSliders();
  initAccordions();
  //initCalculator();
  //initCalcReadyName();
  initTabs();
  initDropdowns();
  initContentSwitch();
  initExpertForm();
  initArticleToc();
  initBackToTop();
  initModals();
  initPromoPopup();
  //initContinueReading();
  initAccessFullArticle();
  initFloatingLabels();
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


/* ---- Multilevel menu — three-column hover menu ----    */
function initMultilevelMenus() {
  document.querySelectorAll("[data-multilevel]").forEach((menu) => {
    const items = menu.querySelectorAll("[data-ml-item]");
    const panels = menu.querySelectorAll("[data-ml-panel]");
    if (!items.length || !panels.length) return;

    const isTouch = () => window.matchMedia("(hover: none)").matches;

    function select(key) {
      items.forEach((it) => it.classList.toggle("is-active", it.dataset.mlItem === key));
      panels.forEach((p) => p.classList.toggle("is-active", p.dataset.mlPanel === key));
    }

    items.forEach((item) => {
      const key = item.dataset.mlItem;
      
      item.addEventListener("mouseenter", () => { if (!isTouch()) select(key); });
      item.addEventListener("focus", () => { if (!isTouch()) select(key); });
      
      item.addEventListener("click", (e) => {
        if (isTouch()) {
          e.preventDefault();
          select(key);
        }
      });
    });

    // feature card shows.
    panels.forEach((panel) => {
      const sublinks = panel.querySelectorAll("[data-ml-feature]");
      const features = panel.querySelectorAll("[data-ml-featurepanel]");
      if (!sublinks.length || !features.length) return;

      function selectFeature(fkey) {
        sublinks.forEach((s) => s.classList.toggle("is-active", s.dataset.mlFeature === fkey));
        features.forEach((f) => f.classList.toggle("is-active", f.dataset.mlFeaturepanel === fkey));
      }

      sublinks.forEach((sub) => {
        const fkey = sub.dataset.mlFeature;
        sub.addEventListener("mouseenter", () => { if (!isTouch()) selectFeature(fkey); });
        sub.addEventListener("focus", () => { if (!isTouch()) selectFeature(fkey); });
        sub.addEventListener("click", (e) => {
          if (isTouch()) { e.preventDefault(); selectFeature(fkey); }
        });
      });
    });

    const navCol = menu.querySelector(".multilevel__nav");
    if (navCol) {
      
      navCol.addEventListener("mouseenter", () => {
        menu.classList.remove("is-col2-lit");
      });
      
      menu.addEventListener("mousemove", (e) => {
        if (isTouch()) return;
        const inNav = navCol.contains(e.target) || e.target === navCol;
        menu.classList.toggle("is-col2-lit", !inNav);
      });
      
      menu.addEventListener("mouseleave", () => {
        menu.classList.remove("is-col2-lit");
      });
    }
  });
}

/* ---- Mega menu dropdowns  ---- */

/* ----  
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
  ---- */
  function initMegaMenus() {
  const items = document.querySelectorAll(".nav__item");
  const isMobile = () =>
    window.matchMedia("(max-width: 1023px)").matches ||
    window.matchMedia("(hover: none)").matches;

  items.forEach((item) => {
    const trigger = item.querySelector(".nav__link");
    const panel = item.querySelector(".mega-panel");
    if (!trigger || !panel) return;

    trigger.addEventListener("click", (e) => {
      if (isMobile()) {
        e.preventDefault();
        const isOpen = panel.classList.contains("is-open");
        closeAllPanels();
        if (!isOpen) {
          panel.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
        }
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

  // Show the starting value up front (unless reduced-motion), so the number
  // doesn't flash its final value before counting up when scrolled into view.
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    stats.forEach((el) => { el.textContent = format(0, el); });
  }

  function format(value, el) {
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const grouped =
      el.dataset.group === "true" ? value.toLocaleString("en-US") : String(value);
    return prefix + grouped + suffix;
  }

  function animateCount(el) {
    const target = parseInt(el.dataset.countTo, 10);
    if (Number.isNaN(target)) return;
    const duration = 1200;
    const start = performance.now();

    // Respect reduced-motion preference: show the final value immediately.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = format(target, el);
      return;
    }

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(Math.round(eased * target), el);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
}

/* ---- Search overlay — slides down ---- */
// function initSearchOverlay() {
//   const openers = document.querySelectorAll("[data-open-search]");
//   const overlay = document.querySelector(".search-overlay");
//   if (!overlay || !openers.length) return;

//   const input = overlay.querySelector(".search-overlay__input");
//   const closeBtn = overlay.querySelector("[data-close-search]");
//   let lastFocused = null;

//   function open() {
//     lastFocused = document.activeElement;
//     overlay.hidden = false;
    
//     requestAnimationFrame(() => overlay.classList.add("is-open"));
//     openers.forEach((o) => o.setAttribute("aria-expanded", "true"));
//     input?.focus();
//   }

//   function close() {
//     overlay.classList.remove("is-open");
//     openers.forEach((o) => o.setAttribute("aria-expanded", "false"));
   
//     const hide = () => { overlay.hidden = true; overlay.removeEventListener("transitionend", hide); };
//     overlay.addEventListener("transitionend", hide);
//     lastFocused?.focus();
//   }

//   openers.forEach((btn) => btn.addEventListener("click", open));
//   closeBtn?.addEventListener("click", close);

//   document.addEventListener("keydown", (e) => {
//     if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
//   });
// }
/* 
function initSearchSuggest() {
  const overlay = document.querySelector(".search-overlay");
  const results = document.querySelector(".search-results");
  if (!overlay || !results) return;

  const input = overlay.querySelector(".search-overlay__input");
  const indexTag = overlay.querySelector("[data-search-index]");
  const label = results.querySelector(".search-results__label");
  const list = results.querySelector(".search-results__list");
  if (!input || !indexTag || !list) return;

  let index = [];
  try {
    index = JSON.parse(indexTag.textContent) || [];
  } catch (e) {
    return; 
  }

  const LIMIT = 8;
  let timer = null;

 
  function esc(s) {
    return s.replace(/[&<>"']/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

 
  function highlight(title, query) {
    const at = title.toLowerCase().indexOf(query.toLowerCase());
    if (at < 0) return esc(title);
    return esc(title.slice(0, at)) +
           "<mark>" + esc(title.slice(at, at + query.length)) + "</mark>" +
           esc(title.slice(at + query.length));
  }

  function render(query) {
    const q = query.trim();

    if (!q) {
      results.hidden = true;
      list.innerHTML = "";
      return;
    }

    const matches = index
      .filter((item) => item.title.toLowerCase().includes(q.toLowerCase()))
      .slice(0, LIMIT);

    label.textContent = matches.length
      ? `Results for “${q}”`
      : `No results for “${q}”`;

    list.innerHTML = matches
      .map((m) => `<li><a class="search-results__link" href="${esc(m.url)}">${highlight(m.title, q)}</a></li>`)
      .join("");

    results.hidden = false;
  }

  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => render(input.value), 150);
  });

 
  overlay.addEventListener("keydown", (e) => {
    const links = Array.from(list.querySelectorAll(".search-results__link"));
    if (!links.length) return;
    const i = links.indexOf(document.activeElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      links[i < 0 ? 0 : (i + 1) % links.length].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (i <= 0) input.focus();
      else links[i - 1].focus();
    }
  });

  
  const closeBtns = overlay.querySelectorAll("[data-close-search]");
  closeBtns.forEach((b) => b.addEventListener("click", () => {
    input.value = "";
    render("");
  }));
}
*/

function initSearchSuggest() {
    const overlay = document.querySelector(".search-overlay");
    const results = document.querySelector(".search-results");
    if (!overlay || !results) return;

    const input = overlay.querySelector(".search-overlay__input");
    const label = results.querySelector(".search-results__label");
    const list = results.querySelector(".search-results__list");
    if (!input || !label || !list) return;

    const regionInput = overlay.querySelector(".search-region, #search-region, [name='search-region']");

    // --- PRODUCTION CONFIGURATION ---
    const LIMIT = 8;
    const MIN_CHARS = 3;
    const DEBOUNCE_MS = 800;    // Increased to 800ms

    let timer = null;
    let abortController = null;
    let lastQuery = "";
    let isComposing = false;
    const cache = new Map();

    input.addEventListener("compositionstart", () => { isComposing = true; });
    input.addEventListener("compositionend", () => {
        isComposing = false;
        input.dispatchEvent(new Event("input"));
    });

    function esc(s) {
        return s.replace(/[&<>"']/g, (c) => (
            { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
        ));
    }

    function highlight(title, query) {
        const at = title.toLowerCase().indexOf(query.toLowerCase());
        if (at < 0) return esc(title);
        return esc(title.slice(0, at)) +
            "<mark>" + esc(title.slice(at, at + query.length)) + "</mark>" +
            esc(title.slice(at + query.length));
    }

    // --- NEW: Helper to show instant loading feedback ---
    function showLoading(query) {
        label.textContent = `Searching for "${query}"...`;
        list.innerHTML = ""; // Optional: Clear old results while searching
        results.hidden = false;
    }

    function render(matches, query) {
        const q = query.trim();

        if (!q || (matches.length === 0 && q.length < MIN_CHARS)) {
            results.hidden = true;
            list.innerHTML = "";
            return;
        }

        label.textContent = matches.length
            ? `Results for "${q}"`
            : `No results for "${q}"`;

        list.innerHTML = matches
            .slice(0, LIMIT)
            .map((m) => `<li><a class="search-results__link" href="${esc(m.post_link)}">${highlight(m.post_title, q)}</a></li>`)
            .join("");

        results.hidden = false;
    }

    input.addEventListener("input", () => {
        if (isComposing) return;

        const query = input.value.trim();
        const region = regionInput ? regionInput.value.trim() : "";
        const cacheKey = `${region}:::${query}`;

        if (query.length < MIN_CHARS) {
            clearTimeout(timer);
            if (abortController) abortController.abort();
            lastQuery = "";
            render([], "");
            return;
        }

        if (query === lastQuery) return;
        lastQuery = query;

        clearTimeout(timer);

        // 1. If cached, render instantly (skip "Searching..." and skip 800ms delay)
        if (cache.has(cacheKey)) {
            if (abortController) abortController.abort();
            render(cache.get(cacheKey), query);
            return;
        }

        // 2. Show "Searching..." IMMEDIATELY on typing so the UI doesn't feel frozen
        showLoading(query);

        // 3. Wait 800ms before firing the network request
        timer = setTimeout(async () => {
            if (abortController) abortController.abort();
            abortController = new AbortController();

            const params = new URLSearchParams({
                region: region,
                q: query,
                switch_site: "cb"
            });

            try {
                const response = await fetch(`/searchALL_JSON?${params.toString()}`, {
                    signal: abortController.signal
                });

                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();

                if (cache.size >= 50) {
                    const oldestKey = cache.keys().next().value;
                    cache.delete(oldestKey);
                }
                cache.set(cacheKey, data);

                render(data, query);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Search API error:", err);
                    label.textContent = "An error occurred while searching.";
                    list.innerHTML = "";
                    results.hidden = false;
                }
            }
        }, DEBOUNCE_MS);
    });

    overlay.addEventListener("keydown", (e) => {
        const links = Array.from(list.querySelectorAll(".search-results__link"));
        if (!links.length) return;
        const i = links.indexOf(document.activeElement);

        if (e.key === "ArrowDown") {
            e.preventDefault();
            links[i < 0 ? 0 : (i + 1) % links.length].focus();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (i <= 0) input.focus();
            else links[i - 1].focus();
        }
    });

    const closeBtns = overlay.querySelectorAll("[data-close-search]");
    closeBtns.forEach((b) => b.addEventListener("click", () => {
        if (abortController) abortController.abort();
        clearTimeout(timer);
        lastQuery = "";
        input.value = "";
        render([], "");
    }));
}

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

 
  const topBar = header.querySelector(".site-header__top");
  const baseTrigger = topBar ? topBar.offsetHeight : 10;
  const TOP_ZONE = baseTrigger + 40; 
  const INTENT = 36;                 
  const LOCK_MS = 550;             

  let lastY = window.scrollY;
  let accum = 0;
  let ticking = false;
  let lockedUntil = 0;

  function apply() {
    ticking = false;

    const headerBottom = Math.max(0, header.getBoundingClientRect().bottom);
    document.documentElement.style.setProperty("--header-h", `${Math.round(headerBottom)}px`);
    let stack = headerBottom;
    if (contactBar && getComputedStyle(contactBar).display !== "none") {
      stack += contactBar.offsetHeight;
    }
    document.documentElement.style.setProperty("--stack-top", `${Math.round(stack)}px`);

    const y = window.scrollY;
    const delta = y - lastY;
    lastY = y;

    if (y <= TOP_ZONE) {
      header.classList.remove("is-stuck");
      accum = 0;
      return;
    }

    if (performance.now() < lockedUntil) { accum = 0; return; }

    if (delta === 0) return;
    if ((delta > 0) !== (accum > 0)) accum = 0; 
    accum += delta;

    if (accum > INTENT && !header.classList.contains("is-stuck")) {
      header.classList.add("is-stuck");    
      accum = 0;
      lockedUntil = performance.now() + LOCK_MS;
    } else if (accum < -INTENT && header.classList.contains("is-stuck")) {
      header.classList.remove("is-stuck");  
      accum = 0;
      lockedUntil = performance.now() + LOCK_MS;
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(apply);
    }
  }

  apply();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
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

        // Single-open: close every item in this accordion first, so only one
        // stays open at a time.
        items.forEach((other) => {
          const t = other.querySelector(".accordion__trigger");
          const p = other.querySelector(".accordion__panel");
          if (!t || !p) return;
          t.setAttribute("aria-expanded", "false");
          p.classList.remove("is-open");
        });

        // Then open the clicked one — unless it was already open (so clicking an
        // open item closes it).
        if (!isOpen) {
          trigger.setAttribute("aria-expanded", "true");
          panel.classList.add("is-open");
        }
      });
    });
  });
}

/* ---- Calculator — multi-step form ----*/
/*  
function initCalcReadyName() {
  const slot = document.querySelector("[data-ready-name]");
  if (!slot) return;
  const name = new URLSearchParams(window.location.search).get("name");
  if (name) slot.textContent = `${name.trim()}, Your`;
}

function initCalculator() {
  document.querySelectorAll("[data-calculator]").forEach((calc) => {
    const steps = Array.from(calc.querySelectorAll("[data-step]"));
    const total = steps.length;
    if (!total) return;

    const bar = calc.querySelector("[data-calc-bar]");
    const count = calc.querySelector("[data-calc-count]");
    const backBtn = calc.querySelector("[data-calc-back]");
    const nextBtn = calc.querySelector("[data-calc-next]");
    const form = calc.querySelector("form") || calc;
    const result = calc.querySelector("[data-calc-result]");
    const formBody = calc.querySelector("[data-calc-body]");
    const redirectTo = calc.dataset.calcRedirect;

    let current = 1;

    function render() {
      steps.forEach((s) => {
        s.classList.toggle("is-active", Number(s.dataset.step) === current);
      });
      if (count) count.textContent = `${current}/${total}`;
      if (bar) bar.style.width = `${(current / total) * 100}%`;
      if (backBtn) backBtn.hidden = current === 1;
      if (nextBtn) nextBtn.textContent = current === total ? "Get my estimate" : "Continue";
    }

    function stepValid() {
      const panel = steps.find((s) => Number(s.dataset.step) === current);
      if (!panel) return true;

      const seenRadioGroups = new Set();

      const fields = panel.querySelectorAll("[required]");
      for (const f of fields) {
        // Radio group checked.
        if (f.type === "radio") {
          if (seenRadioGroups.has(f.name)) continue; // check each group once
          seenRadioGroups.add(f.name);

          const group = panel.querySelectorAll(`input[name="${f.name}"]`);
          const checked = Array.from(group).some((r) => r.checked);
          const wrap = f.closest(".calc__field");
          if (!checked) {
            wrap?.classList.add("is-invalid");
            group[0]?.focus();
            return false;
          }
          wrap?.classList.remove("is-invalid");
          continue;
        }

        // Text / select inputs.
        if (!f.value || !f.value.trim()) {
          f.focus();
          f.classList.add("is-invalid");
          return false;
        }
        f.classList.remove("is-invalid");
      }
      return true;
    }

    function next() {
      if (!stepValid()) return;
      if (current < total) {
        current += 1;
        render();
      } else {
        // Last step done. 
        const nameField = calc.querySelector('[name="name"]');
        const first = (nameField?.value || "").trim().split(/\s+/)[0];

        if (redirectTo) {
          const url = new URL(redirectTo, window.location.href);
          if (first) url.searchParams.set("name", first);
          window.location.href = url.toString();
          return;
        }

        // Otherwise reveal the inline result panel.
        const nameSlot = calc.querySelector("[data-calc-name]");
        if (nameSlot) nameSlot.textContent = first ? `${first}, Your` : "Your";
        if (formBody) formBody.hidden = true;
        if (result) result.classList.add("is-active");
      }
    }

    function back() {
      if (current > 1) { current -= 1; render(); }
    }

    nextBtn?.addEventListener("click", (e) => { e.preventDefault(); next(); });
    backBtn?.addEventListener("click", (e) => { e.preventDefault(); back(); });
    form.addEventListener("submit", (e) => { e.preventDefault(); next(); });

    render();
  });
}
*/

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


    document.querySelectorAll("[data-promo-popup].is-open").forEach((promo) => {
      if (promo !== overlay) close(promo);
    });

    lastFocused.set(overlay, trigger || document.activeElement);
    overlay.classList.add("is-open");

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

    function select(tab, updateHash) {
      tabButtons.forEach((btn) => {
        const selected = btn === tab;
        btn.setAttribute("aria-selected", String(selected));
        // Roving tabindex: only the active tab is in the tab order.
        btn.setAttribute("tabindex", selected ? "0" : "-1");
      });

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

      if (updateHash && history.replaceState) {
        history.replaceState(null, "", "#" + tab.id);
      }
    }

    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => select(btn, true));
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
      select(next, true);
      next.focus();
    });

    let initial = null;
    const hash = window.location.hash.slice(1);
    let matchedHash = false;
    if (hash) {
      initial = tabButtons.find((b) =>
        b.id === hash || b.getAttribute("aria-controls") === hash
      );
      matchedHash = Boolean(initial);
    }
    if (!initial) {
      initial = tabButtons.find((b) => b.getAttribute("aria-selected") === "true") || tabButtons[0];
    }
    select(initial, false);

    if (matchedHash) {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";

      const savedHash = window.location.hash;
      history.replaceState(null, "", window.location.pathname + window.location.search);
      window.scrollTo(0, 0);

      const smoothToTab = () => {
        const headerH = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue("--header-h"), 10
        ) || 90;
        const gap = 16;

        const rectTop = initial.getBoundingClientRect().top; 
        const absoluteTop = window.scrollY + rectTop;       
        const target = Math.max(0, absoluteTop - headerH - gap);

        if (rectTop >= headerH + gap && rectTop <= window.innerHeight) return;

        window.scrollTo({ top: target, behavior: "smooth" });
      };
      window.addEventListener("load", () => {
        requestAnimationFrame(() => {
          smoothToTab();
          history.replaceState(null, "", savedHash);
        });
      }, { once: true });
    }
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

  const delay = Number(popup.dataset.promoDelay) || 10000;
  const scrollPct = Number(popup.dataset.promoScroll) || 45;


  const firstSection = document.querySelector("main > section") || document.querySelector("main");

  let fired = false;
  let timer = null;

  function markSeen() {
    try { sessionStorage.setItem(KEY, "1"); } catch (e) { /* ignore */ }
  }

 
  function otherModalOpen() {
    return Array.from(document.querySelectorAll(".modal-overlay.is-open"))
      .some((o) => o !== popup);
  }

  function fire() {
    if (fired) return;


    if (otherModalOpen()) {
      clearTimeout(timer);
      timer = setTimeout(fire, 1000);
      return;
    }

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
/* ---- Testimonial slider ---- */
function initTestimonialSplide() {
  const el = document.querySelector("data-guide-slider");
  if (!el || typeof Splide === "undefined") return;
    els.forEach((el) => {
    const perView = Number(el.dataset.guidePerview) || 3;
    const perTablet = Number(el.dataset.guideTablet) || 3;
    const autoplay = el.dataset.guideAutoplay === "1";

  new Splide(el, {
    type: "loop",
    perPage: 2,
    arrows: false,
    pagination: true,
    autoplay: true,
    interval: 6000,
    pauseOnHover: true,
    speed: 500,
          breakpoints: {
        1024: { perPage: perTablet },
        768: { perPage: 2 },
        560: { perPage: 1 },
      },
    
  }).mount();
   });
}

function initGuideSliders() {
  const els = document.querySelectorAll("[data-guide-slider]");
  if (!els.length || typeof Splide === "undefined") return;

  els.forEach((el) => {
    const perView = Number(el.dataset.guidePerview) || 3;
    const perTablet = Number(el.dataset.guideTablet) || 3;
    const autoplay = el.dataset.guideAutoplay === "1";

    new Splide(el, {
      type: "loop",
      perPage: perView,
      perMove: 1,
      gap: "1.5rem",
      arrows: false,
      pagination: true,
      autoplay,
      interval: 5000,
      pauseOnHover: true,
      speed: 500,
      breakpoints: {
        1024: { perPage: perTablet },
        768: { perPage: 2 },
        560: { perPage: 1 },
      },
    }).mount();
  });
}

function initFeatureToggle() {
  const lists = document.querySelectorAll(".feature-links");
  if (!lists.length) return;

  lists.forEach((list) => {
    const items = Array.from(list.querySelectorAll(".feature-links__item"));
    const btn = list.querySelector(".feature-links__more");
    const visible = Number(list.dataset.visible) || 8;
    if (!btn || items.length <= visible) {
      // Nothing to hide — drop the toggle so it doesn't dangle.
      btn?.remove();
      return;
    }

    const hidden = items.slice(visible);

    function apply(expanded) {
      hidden.forEach((el) => el.classList.toggle("is-hidden", !expanded));
      btn.setAttribute("aria-expanded", String(expanded));
      btn.setAttribute("aria-label", expanded ? "Show fewer" : "Show more");
    }

    apply(false); // start collapsed

    btn.addEventListener("click", () => {
      apply(btn.getAttribute("aria-expanded") !== "true");
    });
  });
}

/**
function initContinueReading() {
  const body = document.querySelector(".article-body");
  if (!body) return;

  const mq = window.matchMedia("(max-width: 1023px)");

  const INITIAL = 2;
  const STEP = 2;


  function buildSections() {
    const sections = [];
    let current = [];
    Array.from(body.children).forEach((el) => {
      if (el.tagName === "H2" && current.length) {
        sections.push(current);
        current = [];
      }
      current.push(el);
    });
    if (current.length) sections.push(current);
    return sections;
  }

  let button = null;

  function teardown() {
    body.classList.remove("is-collapsed");
    body.querySelectorAll(".continue-hidden, .continue-fade").forEach((el) => {
      el.classList.remove("continue-hidden", "continue-fade");
    });
    if (button) { button.remove(); button = null; }
  }

  function collapse() {
    const sections = buildSections();
    
    if (sections.length <= INITIAL + 1) { teardown(); return; }

    let shown = INITIAL;

    function apply() {
      const hiddenCount = sections.length - shown;
      sections.forEach((section, i) => {
        section.forEach((el) => {
          el.classList.toggle("continue-hidden", i >= shown);
          el.classList.remove("continue-fade");
        });
        // Fade the last currently-visible section.
        if (i === shown - 1) section.forEach((el) => el.classList.add("continue-fade"));
      });

      body.classList.toggle("is-collapsed", hiddenCount > 0);

      if (hiddenCount <= 0) { teardown(); return; }
      button.querySelector(".continue-reading__count").textContent =
        `${hiddenCount} more section${hiddenCount === 1 ? "" : "s"}`;
    }

    if (!button) {
      button = document.createElement("div");
      button.className = "continue-reading is-active";
      button.innerHTML =
        '<button class="continue-reading__btn" type="button">Continue Reading' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
        '</button><p class="continue-reading__count"></p>';
      body.after(button);

      button.querySelector(".continue-reading__btn").addEventListener("click", () => {
        shown += STEP;
        apply();
      });
    }

    apply();
  }

  function sync() {
    if (mq.matches) collapse();
    else teardown();
  }

  sync();
  mq.addEventListener ? mq.addEventListener("change", sync) : mq.addListener(sync);
}
*/

function initContentSwitch() {
  const groups = document.querySelectorAll("[data-switch]");
  if (!groups.length) return;

  groups.forEach((group) => {
    const panels = Array.from(group.querySelectorAll("[data-switch-panel]"));
    const triggers = Array.from(group.querySelectorAll("[data-switch-target]"));
    const label = group.querySelector(".dropdown__label");
    if (!panels.length) return;

    function show(key, labelText) {
      panels.forEach((p) => p.classList.toggle("is-active", p.dataset.switchPanel === key));
      if (label && labelText) label.textContent = labelText;
      // Mark the chosen trigger for styling / a11y.
      triggers.forEach((t) => t.setAttribute("aria-current", String(t.dataset.switchTarget === key)));
    }

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        show(trigger.dataset.switchTarget, trigger.dataset.switchLabel);

        // If the trigger lives in a dropdown, close it — it acted as a pick,
        // not a navigation link, so the menu shouldn't stay open.
        const dd = trigger.closest("[data-dropdown]");
        if (dd) {
          dd.classList.remove("is-open");
          dd.querySelector(".dropdown__trigger")?.setAttribute("aria-expanded", "false");
        }
      });
    });

    // Initial panel: the group's default, or the first panel.
    const initial = group.dataset.switchDefault || panels[0].dataset.switchPanel;
    const initialTrigger = triggers.find((t) => t.dataset.switchTarget === initial);
    show(initial, initialTrigger ? initialTrigger.dataset.switchLabel : null);
  });
}

function initAccessFullArticle() {
  document.querySelectorAll(".access-full-article").forEach((gate) => {
    const btn = gate.querySelector(".access-full-article__action button");
    if (!btn) return;

    btn.addEventListener("click", () => {
      gate.classList.add("is-expanded");
    });
  });
}

function initFloatingLabels() {
  const fields = document.querySelectorAll(".input");
  if (!fields.length) return;

  fields.forEach((field) => {
    function updateLabel() {
      field.classList.toggle("has-value", field.value.trim() !== "");
    }
    updateLabel();
    field.addEventListener("input", updateLabel);
    field.addEventListener("blur", updateLabel);
  });
}