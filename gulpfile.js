"use strict";

const gulp = require('gulp'),
  sass = require('gulp-sass')(require('sass')),
  del = require('del'),
  path = require('path'),
  rename = require("gulp-rename"),
  autoprefixer = require('gulp-autoprefixer'),
  fileinclude = require('gulp-file-include'),
  htmlbeautify = require('gulp-html-beautify'),
  browserSync = require('browser-sync').create();

// Clean up 'dist' directory
gulp.task('clean', () => del(['dist']));

// Compile and Minify SCSS to .min.css
gulp.task('scss', function compileScss() {
  const scssOptions = {
    outputStyle: 'expanded',
    quietDeps: true,
    sourceComments: false, // Exclude source comments
  };

  return gulp.src(['./assets/scss/*.scss'])
    .pipe(sass.sync(scssOptions).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(rename(function (path) {}))
    .pipe(gulp.dest('./dist/assets/css'))
    .pipe(browserSync.stream());
});

// Process HTML partials
gulp.task('html:partials', () => gulp.src(['*.html'])
  .pipe(fileinclude({ prefix: '@@', basepath: '@file' }))
  .pipe(gulp.dest('./dist/'))
  .pipe(browserSync.stream())
);

// Copy assets to 'dist' directory excluding SCSS
gulp.task("copyAssets", () => gulp.src(['!*.html', "assets/**/*", "!assets/scss/**"], { base: './' })
  .pipe(gulp.dest('dist'))
);

// Beautify HTML files
gulp.task('beautify-html', () => {
  const options = { indentSize: 2 };
  return gulp.src('dist/*.html')
    .pipe(htmlbeautify(options))
    .pipe(gulp.dest('dist/'))
});

function generateHtmlSitemap(files) {
  const domain = 'https://apex-flavors.netlify.app'; // Replace with your domain

  let links = files.map(file => {
    let relativePath = path.relative('./dist/', file.path);
    return `<li><a href="${domain}/${relativePath}">${relativePath}</a></li>`;
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sitemap</title>
    </head>
    <body>
      <ul>
        ${links.join('\n')}
      </ul>
    </body>
    </html>
  `;
}

gulp.task('generate-html-sitemap', (done) => {
  let allHtmlFiles = [];

  gulp.src('dist/*.html')
    .on('data', (file) => {
      allHtmlFiles.push(file);
    })
    .on('end', () => {
      let sitemapContent = generateHtmlSitemap(allHtmlFiles);
      require('fs').writeFileSync('dist/sitemap.html', sitemapContent);
      done();
    });
});

// Update Main build task
gulp.task("build", gulp.series("clean", gulp.parallel('scss'), 'html:partials', 'copyAssets', 'beautify-html', 'generate-html-sitemap'));

gulp.task('dev', function watchChanges(done) {
  browserSync.init({ server: { baseDir: "./dist" } });

  // Watch SCSS files and run the SCSS task on changes
  gulp.watch(['assets/scss/*.scss', 'assets/scss/**/*.scss', '!assets/scss/bootstrap/**'], gulp.series('scss'))
    .on('change', browserSync.reload); // Reload browser on SCSS changes

  // Process HTML on changes
  gulp.watch(['*.html', './partials/**/*.html'], gulp.series('html:partials'))
    .on('change', browserSync.reload); // Reload browser on HTML changes

  // Watch for changes in assets and copy them
  gulp.watch(['assets/**/*', '!assets/scss/**', '!assets/js/**'], gulp.series('copyAssets'))
    .on('change', browserSync.reload); // Reload browser on assets changes

  done();
});

// Default task - runs the build task and then starts watching for changes
gulp.task("default", gulp.series("build", "dev"));

