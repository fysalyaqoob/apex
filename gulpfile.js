"use strict";

var gulp = require('gulp'),
  sass = require('gulp-sass')(require('sass')),
  del = require('del'),
  uglify = require('gulp-uglify'),
  cleanCSS = require('gulp-clean-css'),
  rename = require("gulp-rename"),
  merge = require('merge-stream'),
  htmlreplace = require('gulp-html-replace'),
  autoprefixer = require('gulp-autoprefixer'),
  purgecss = require('gulp-purgecss'),
  fileinclude = require('gulp-file-include'),
  htmlbeautify = require('gulp-html-beautify'),
  browserSync = require('browser-sync').create();

// Clean task
gulp.task('clean', function() {
  return del(['dist', 'assets/css/app.css']);
});

// Copy third party libraries from node_modules into /vendor
gulp.task('vendor:js', function() {
  return gulp.src([
    './node_modules/bootstrap/dist/js/*',
    './node_modules/@popperjs/core/dist/umd/popper.*'
  ])
    .pipe(gulp.dest('./assets/js/vendor'));
});

// Copy bootstrap-icons from node_modules into /fonts
gulp.task('vendor:fonts', function() {
  return  gulp.src([
    './node_modules/bootstrap-icons/**/*',
    '!./node_modules/bootstrap-icons/package.json',
    '!./node_modules/bootstrap-icons/README.md',
  ])
    .pipe(gulp.dest('./assets/fonts/bootstrap-icons'))
});

// vendor task
gulp.task('vendor', gulp.parallel('vendor:fonts', 'vendor:js'));

// Copy vendor's js to /dist
gulp.task('vendor:build', function() {
  var jsStream = gulp.src([
    './assets/js/vendor/bootstrap.bundle.min.js',
    './assets/js/vendor/popper.min.js'
  ])
    .pipe(gulp.dest('./dist/assets/js/vendor'));
  var fontStream = gulp.src(['./assets/fonts/bootstrap-icons/**/*.*']).pipe(gulp.dest('./dist/assets/fonts/bootstrap-icons'));
  return merge (jsStream, fontStream);
})

// Copy Bootstrap SCSS(SASS) from node_modules to /assets/scss/bootstrap
gulp.task('bootstrap:scss', function() {
  return gulp.src(['./node_modules/bootstrap/scss/**/*'])
    .pipe(gulp.dest('./assets/scss/bootstrap'));
});

// Compile SCSS(SASS) files
gulp.task('scss', gulp.series('bootstrap:scss', function compileScss() {
  return gulp.src(['./assets/scss/*.scss'])
    .pipe(sass.sync({
      outputStyle: 'expanded',
      quietDeps: true
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest('./assets/css'))
}));

// Minify CSS
gulp.task('css:minify', gulp.series('scss', function cssMinify() {
  return gulp.src("./assets/css/*.css")
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/assets/css'))
    .pipe(browserSync.stream());
}));

// Minify Js
gulp.task('js:minify', function () {
  return gulp.src([
    './assets/js/app.js'
  ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/assets/js'))
    .pipe(browserSync.stream());
});

gulp.task('html:partials', function() {
  return gulp.src(['*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./dist/'))
    .pipe(browserSync.stream());
});

// Replace HTML block for Js and Css file to min version upon build and copy to /dist
gulp.task('replaceHtmlBlock', function () {
  return gulp.src(['dist/*.html']) // Target dist directory
    .pipe(htmlreplace({
      'js': 'assets/js/app.min.js',
      'css': 'assets/css/app.min.css'
    }))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream());
});

// Configure the browserSync task and watch file path for change
gulp.task('dev', function browserDev(done) {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
  gulp.watch(['assets/scss/*.scss', 'assets/scss/**/*.scss', '!assets/scss/bootstrap/**'], gulp.series('css:minify', function cssBrowserReload(done) {
    browserSync.reload();
    done(); //Async callback for completion.
  }));
  gulp.watch('assets/js/app.js', gulp.series('js:minify', function jsBrowserReload(done) {
    browserSync.reload();
    done();
  }));

  // Watch for changes in HTML files and process them
  gulp.watch(['*.html', './partials/**/*.html'], gulp.series('html:partials', function htmlBrowserReload(done) {
    browserSync.reload();
    done();
  }));

  done();
});

gulp.task("copyAssets", function() {
  return gulp.src([
    '!*.html',
    "assets/**/*"
  ], { base: './'})
    .pipe(gulp.dest('dist'));
});

gulp.task('purge-unused-css', function() {
  return gulp.src('./dist/assets/css/*.min.css') 
    .pipe(purgecss({
      content: ['./dist/*.html', './dist/assets/js/*.js'], 
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    }))
    .pipe(gulp.dest('./dist/assets/css')); 
});

gulp.task('beautify-html', function() {
  var options = {
    indentSize: 2
  };
  return gulp.src('dist/*.html')
    .pipe(htmlbeautify(options))
    .pipe(gulp.dest('dist/'))
});

// Build task
gulp.task("build", gulp.series(
  "clean",
  gulp.parallel('css:minify', 'js:minify', 'vendor'),
  'html:partials',
  'copyAssets',
  'beautify-html',
  'replaceHtmlBlock',
  'purge-unused-css',
  'vendor:build'
));

// Default task
gulp.task("default", gulp.series("build"));
