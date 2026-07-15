# Meridian Advisory — Sample Project (Gulp Build)

A sample corporate-advisory landing page built to match the **layout pattern**
of a reference consulting/advisory site: announcement bar, two-tier
mobile-first mega-menu header, hero with an auto-scrolling client-logo
marquee, an about section with animated stat counters, a services grid, a
Splide-powered testimonial slider, an insights/blog grid, a dark CTA band,
and a rich multi-column footer with a contact modal.

All branding, copy, client names, and testimonials here are original
placeholders — not the reference company's actual logos, clients, or quotes.
Swap them for your own content before shipping.

## Requirements

- Node.js 18+ and npm

## Getting started

```bash
npm install
npm start        # gulp serve — builds, opens a dev server with live reload
```

```bash
npm run build    # gulp build — one-off production build into dist/
```

Dev server runs at `http://localhost:3000` (BrowserSync also exposes a
control UI at `:3001`). Edit anything in `src/` and the browser updates
automatically — full reload for HTML/JS/images, CSS-injected (no reload)
for Sass changes.

## Project structure

```
src/
  html/
    index.html             Homepage
    includes/               Shared partials — never output as standalone pages
      header.html
      footer.html
    about-us/
      overview.html         Story, values, leadership, offices — distinct from homepage
    news/
      article-detail.html   Full editorial article — sticky "Get Expert Advice" sidebar
      article-gated.html    Gated preview — content fades out behind a lock CTA
    services/
      overview.html         Full services listing — linked from header "Solutions" menu
    sections/               Reusable section partials (like includes/, excluded from output)
      topic-economy.html      A topic block: lead card + headline list + adviser strip
      topic-tax.html
      topic-regulatory.html

  scss/
    main.scss                Entry point — @use order controls the CSS cascade

    base/
      _tokens.scss           Sass variables (breakpoints) + CSS custom properties
      _base.scss              Reset, element defaults, accessibility fundamentals
      _fonts.scss             Self-hosted @font-face (Poppins)

    layout/
      _grid.scss              Container, grid, flex, mobile-first breakpoint mixin
      _header.scss            Announcement bar + two-tier mobile-first mega-nav header
      _footer.scss            Multi-column footer

    components/
      _buttons.scss           .btn and its modifiers (primary, subscribe, sizes...)
      _cards.scss              .card, .card--insight, .tag
      _modal.scss              Contact modal + form fields
      _search.scss             Full-width search overlay (slides down from header)
      _testimonial.scss        Visual theme layered on top of Splide's own classes
      _accordion.scss          FAQ-style collapsible sections
      _pagination.scss         Prev/next + page-number list, for future listing pages

    pages/
      _home.scss               Marketing blocks used mainly on the homepage
                                (marquee, stats, CTA band) — global, not standalone
      _services.scss           Scaffold for global services-page overrides
                                (see comment inside — distinct from mockups-css/service.scss)

    mockups-css/               Standalone stylesheets, each compiled to its OWN CSS file
      about.scss                → dist/css/mockups-css/about.min.css
      article.scss              → dist/css/mockups-css/article.min.css (article layout + sticky sidebar)
      home-insights.scss        → dist/css/mockups-css/home-insights.min.css (news-style homepage)
      news.scss                 → dist/css/mockups-css/news.min.css
      service.scss               → dist/css/mockups-css/service.min.css

    utilities/
      _utilities.scss           Small single-purpose helper classes (text size, spacing,
                                  hide-mobile/hide-desktop, eyebrow label, etc.)

    vendors/
      _splide.scss               Splide.js CORE CSS, copied verbatim from the npm
                                  package — do not hand-edit, see file header

  js/
    main.js                    Nav toggle, mega menu, stat counters, Splide init,
                                accordion, modal
    vendor/
      splide.min.js             Splide.js library — concatenated BEFORE main.js
                                  (see gulpfile.js `paths.js` ordering)

  assets/
    img/                        Source images (optimized into dist/img on build)
    fonts/
      poppins/                  Self-hosted Poppins .woff2 (300/400/500/600/700)
    icons/

dist/                           Generated output — do not edit directly
gulpfile.js                     Build pipeline (see below)
```

### Why some things live where they do

- **`pages/_home.scss` vs `mockups-css/*.scss`** — anything in `pages/` is
  `@use`'d into the *global* `main.scss` cascade, so its classes are
  available on every page. Anything in `mockups-css/` compiles to its
  *own separate* CSS file, loaded only by the one page that needs it. `.stat`
  and `.cta-band` live in `pages/_home.scss` (not a mockup file) precisely
  because About Us and Services reuse them too.
- **`vendors/_splide.scss`** is a verbatim copy of Splide's core CSS — never
  hand-edit it. Our own look for the testimonial slider (dot colors, sizing)
  lives in `components/_testimonial.scss`, layered on top by cascade order
  (`vendors` is `@use`'d before `components` in `main.scss`).

### Path convention

All internal `css`/`js`/`index.html` references use **root-relative paths**
(e.g. `/css/main.min.css`, `/index.html`) instead of relative paths like
`../css/main.min.css`. Since `header.html`/`footer.html` are shared includes
reused at every folder depth, a relative path that's correct at one depth
breaks at another. Root-relative paths resolve the same everywhere because
BrowserSync/any static host serves `dist/` as the site root. **Follow this
convention for any new page or include you add.**

## What the Gulp pipeline does

| Task       | What it does                                                              |
|------------|----------------------------------------------------------------------------|
| `styles`   | Compiles `main.scss` + everything in `mockups-css/` → autoprefixes → writes readable **and** minified CSS with sourcemaps |
| `scripts`  | Concatenates `src/js/vendor/**/*.js` (Splide, loaded first) + `src/js/main.js` → writes readable `main.js` **and** minified `main.min.js` with a sourcemap |
| `images`   | Runs `src/assets/img/**/*` through imagemin into `dist/img`                |
| `fonts`    | Copies `src/assets/fonts/**/*` (self-hosted Poppins woff2) into `dist/fonts` |
| `html`     | Processes `@@include(...)` partials in `src/html/**/*.html` (excluding `includes/`) and writes to `dist/`, preserving folder depth |
| `clean`    | Removes `dist/` before a fresh build                                      |
| `build`    | `clean` → `styles` + `scripts` + `images` + `fonts` + `html` in parallel   |
| `serve`/default | `build` → starts BrowserSync on `dist/` → watches `src/` and rebuilds + reloads on change |

Adding a new SCSS partial anywhere under `src/scss/` is picked up
automatically by the `src/scss/**/*.scss` glob — you only need to add an
explicit `@use "folder/name";` line to `main.scss` (or to whichever partial
should pull it in) for it to actually be included in the compiled CSS.

## Fonts

Poppins is **self-hosted**, not pulled from the Google Fonts CDN: the `.woff2`
files live in `src/assets/fonts/poppins/` and are declared via `@font-face`
in `src/scss/base/_fonts.scss`. `--font-body` in `base/_tokens.scss` points
to it. `--font-display` (headings) still uses Source Serif 4 via the Google
Fonts `@import` in `main.scss` — only the body/UI font was switched, by
request. To add another self-hosted family, drop the `.woff2` files in
`src/assets/fonts/<name>/` and add matching `@font-face` blocks to
`base/_fonts.scss`.

The published page references `css/main.min.css` and `js/main.min.js` (the
production files); the unminified copies sit alongside them for debugging.

## Testimonial slider (Splide.js)

The testimonial carousel uses [Splide](https://splidejs.com/) rather than a
hand-rolled slider:

- **Markup**: `.splide.testimonial-slider > .splide__track > .splide__list > .splide__slide`
  (see `src/html/index.html` and `src/html/news/article-detail.html`)
- **JS**: `initTestimonialSplide()` in `main.js` — `new Splide(...)` with
  `type: "loop"`, autoplay every 6s, pause on hover, dot pagination, no arrows
- **CSS**: `vendors/_splide.scss` (core, unmodified) + `components/_testimonial.scss`
  (Meridian's own colors/sizing on top of Splide's `.splide__pagination`,
  `.splide__pagination__page`, etc.)

To add a slider elsewhere, reuse the same three-part pattern: Splide markup →
a `new Splide(...)` call → your own visual layer in a new or existing
`components/*.scss` partial.

## Layout → checklist mapping

- **Two-tier mobile-first mega-menu nav**: `layout/_header.scss` — `.nav__item` /
  `.mega-panel` (hover-opens on desktop, click/tap drawer on mobile), toggled by
  `initMegaMenus()` and `initMobileNav()` in `main.js`
- **Logo marquee**: `pages/_home.scss` `.marquee` — pure CSS keyframe animation,
  pauses on hover, respects `prefers-reduced-motion` by inheriting the
  reduced-motion global rule
- **Animated stat counters**: `.stat` markup + `initStatCounters()`, using
  `IntersectionObserver` so it only runs once the section scrolls into view
- **Testimonial slider**: Splide.js — see section above
- **Accordion**: `components/_accordion.scss` + `initAccordions()` — collapsible
  `.accordion__item` rows, ready for a future FAQ section
- **Article layout + sticky sidebar**: `mockups-css/article.scss` — two-column
  editorial layout (`.article__grid`) with a "Get Expert Advice" form that is
  `position: sticky` on desktop and a collapsible `<details>` in the flow on
  mobile. `initExpertForm()` in `main.js` forces it open on desktop (so the
  sticky card just shows) and collapses it on mobile so the article leads.
  The gated variant (`news/article-gated.html`) fades the body out under an
  "Access The Full Article" lock CTA via `.article-gate__fade`
- **Reusable section partials**: `src/html/sections/*.html` are pulled into
  `index.html` with `@@include`, exactly like `includes/` — the topic block
  (lead card + headline list + adviser strip) is authored once and reused per
  topic. They're excluded from the HTML output glob so they never emit as
  standalone pages
- **Newsletter band + footer**: the "Get free access…" signup band and the
  multi-column footer both live in `includes/footer.html` (shared on every
  page); styles in `layout/_footer.scss`
- **Advisory carousel**: `mockups-css/home-insights.scss` `.advisory-carousel`
  + `initAdvisoryCarousel()` — a Splide slider (arrows + dots) with an intro
  column and a 2×2 grid of service cards per slide
- **Collapsible TOC**: the article "In this article" box is a `<details>`
  (`.article-toc`) — open by default, click the summary to collapse
- **Sticky sidebar (fixed)**: `position: sticky` now sits on the `<details>`
  wrapper (`.expert-form-wrap`), the direct child of the grid track, with
  `align-self: start`; `top` uses `--header-h` (measured live in
  `initHeaderHeightVar()`) so it parks just under the sticky header
- **Back-to-top**: `.to-top` button in the footer include + `initBackToTop()`
  — appears after scrolling 400px, smooth-scrolls to top on click
- **Dummy images**: placeholder JPGs in `src/assets/img/dummy/` fill every
  image slot (hero, thumbnails, covers, avatar, CTA); swap for real assets
- **Search overlay**: `components/_search.scss` + `initSearchOverlay()` — the
  header search icon (`[data-open-search]`) slides a full-width search panel
  down from the top; closes on its own X button or Escape, and returns focus
  to the icon. The nav hamburger (`.nav-toggle`) swaps to an X icon while the
  mobile drawer is open — driven purely by CSS off the button's
  `aria-expanded` state, no separate icon-toggling JS
- **Contact modal**: `.modal-overlay` + `initContactModal()` — opens from any
  `[data-open-modal]` trigger, closes on backdrop click, close button, or
  Escape, and returns focus to the trigger element
- **Accessibility**: skip link, labelled landmarks, `:focus-visible` ring in a
  color distinct from the brand palette, decorative SVGs marked
  `aria-hidden`, all form inputs have real `<label for>`

## Known cosmetic warning

You'll see a `legacy-js-api` deprecation notice during `gulp build` — that
comes from `gulp-sass`'s internal implementation, not from any code in this
project. It's harmless today; if it becomes an issue, migrating to a
`sass-embedded`-based Gulp plugin will resolve it.

## Re-skinning this for a different brand

Everything routes through `src/scss/base/_tokens.scss` (colors, type,
spacing, radius, shadow). Change values there and rebuild — no other file
needs to change to reskin the visual identity.
