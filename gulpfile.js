const fs = require("fs/promises");
const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer").default; // v9+ is ESM-only; CJS interop exposes it under .default
const cleanCSS = require("gulp-clean-css");
const sourcemaps = require("gulp-sourcemaps");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const fileInclude = require("gulp-file-include");
const browserSync = require("browser-sync").create();

const paths = {
  scss: "src/scss/**/*.scss",
  scssEntry: ["src/scss/main.scss", "src/scss/vb-main.scss"],
  scssMockups: "src/scss/mockups-css/**/*.scss",
  js: ["src/js/vendor/**/*.js", "src/js/main.js"],
  img: "src/assets/img/**/*",
  fonts: "src/assets/fonts/**/*",
  // html: ["src/html/**/*.html", "!src/html/includes/**", "!src/html/sections/**", "!src/html/site_VB/**", "!src/html/site_VB/includes/**"],
  html: ["src/html/**/*.html", "!src/html/**/includes/**", "!src/html/**/sections/**"],
  dist: "dist",
};

/* ---- Clean ---- */
function clean() {
  return fs.rm(paths.dist, { recursive: true, force: true });
}

/* ---- Styles: Sass -> autoprefix -> sourcemap -> minify -> dist/css ---- */

function styles() {
  return gulp
    //.src([paths.scssEntry, paths.scssMockups], { base: "src/scss"})
    .src(
      [
        ...paths.scssEntry,
        paths.scssMockups
      ],
      { base: "src/scss" }
    )
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(gulp.dest(`${paths.dist}/css`)) // unminified, readable copy for dev
    .pipe(cleanCSS())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(`${paths.dist}/css`))
    .pipe(browserSync.stream());
}

/* ---- Scripts: concat -> minify -> dist/js ---- */
function scripts() {
  return gulp
    .src(paths.js)
    .pipe(sourcemaps.init())
    .pipe(concat("main.js"))
    .pipe(gulp.dest(`${paths.dist}/js`)) // unminified, readable copy for dev
    .pipe(uglify())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(`${paths.dist}/js`))
    .pipe(browserSync.stream());
}

/* ---- Images: optimize -> dist/img ---- */
function images() {
  return gulp
    .src(paths.img, { encoding: false })
    .pipe(imagemin())
    .pipe(gulp.dest(`${paths.dist}/img`));
}

/* ---- Fonts: copy as-is -> dist/fonts (already optimized woff2, no processing needed) ---- */
function fonts() {
  return gulp
    .src(paths.fonts, { encoding: false })
    .pipe(gulp.dest(`${paths.dist}/fonts`));
}

/* ---- HTML: process includes -> copy -> dist ---- */
function html() {
  return gulp
    .src(paths.html, { base: "src/html" })
    .pipe(fileInclude({ basepath: "src/html" }))
    .pipe(gulp.dest(paths.dist));
}

/* ---- Dev server + watch ---- */
function serve(done) {
  browserSync.init({
    server: { baseDir: paths.dist },
    open: false,
    notify: false,
  });
  done();
}

function reload(done) {
  browserSync.reload();
  done();
}

function watchFiles() {
  const enablePolling = process.env.GULP_POLL === "true";
  const pollInterval = process.env.GULP_POLL_INTERVAL
    ? Number(process.env.GULP_POLL_INTERVAL)
    : 1000;
  const htmlWatchOptions = enablePolling
    ? { usePolling: true, interval: pollInterval }
    : null;

  gulp.watch(paths.scss, styles);
  gulp.watch(paths.scssMockups, gulp.series(styles, reload));
  gulp.watch(paths.js, gulp.series(scripts, reload));
  gulp.watch(paths.img, gulp.series(images, reload));
  gulp.watch(paths.fonts, gulp.series(fonts, reload));

  if (htmlWatchOptions) {
    gulp.watch(paths.html, htmlWatchOptions, gulp.series(html, reload));
  } else {
    gulp.watch(paths.html, gulp.series(html, reload));
  }
}

const build = gulp.series(clean, gulp.parallel(styles, scripts, images, fonts, html));
const dev = gulp.series(build, serve, watchFiles);

exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.fonts = fonts;
exports.html = html;
exports.build = build;
exports.serve = dev;
exports.default = dev;
