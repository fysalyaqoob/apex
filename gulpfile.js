"use strict";

const gulp = require('gulp'),
  sass = require('gulp-sass')(require('sass')),
  del = require('del'),
  cleanCSS = require('gulp-clean-css'),
  rename = require("gulp-rename"),
  htmlreplace = require('gulp-html-replace'),
  autoprefixer = require('gulp-autoprefixer'),
  fileinclude = require('gulp-file-include'),
  htmlbeautify = require('gulp-html-beautify'),
  webpack = require('webpack-stream'),
  TerserPlugin = require('terser-webpack-plugin'),
  browserSync = require('browser-sync').create();

// Clean up 'dist' directory
gulp.task('clean', () => del(['dist']));

// Copy bootstrap SCSS files
gulp.task('bootstrap:scss', () => gulp.src(['./node_modules/bootstrap/scss/**/*'])
  .pipe(gulp.dest('./assets/scss/bootstrap')));

// Compile and Minify SCSS to .min.css
gulp.task('scss', gulp.series('bootstrap:scss', function compileScss() {
  return gulp.src(['./assets/scss/*.scss'])
    .pipe(sass.sync({ outputStyle: 'expanded', quietDeps: true }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./dist/assets/css'))
    .pipe(browserSync.stream());
}));

// Copy SCSS files without minification
gulp.task('scss:copy', gulp.series('bootstrap:scss', function copyScss() {
  return gulp.src(['./assets/scss/*.scss'])
    .pipe(sass.sync({ outputStyle: 'expanded', quietDeps: true }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest('./dist/assets/css'))
    .pipe(browserSync.stream());
}));

const webpackConfig = {
  mode: 'production',
  entry: {
    app: './assets/js/app.js' // Specify the entry point for webpack
  },
  output: {
    filename: '[name].min.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
};

// JS: Webpack (minified)
gulp.task('js:webpack:minified', () => {
  return gulp.src('./assets/js/app.js')
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest('./dist/assets/js'))
    .pipe(browserSync.stream());
});

// JS: Webpack (unminified)
gulp.task('js:webpack:unminified', () => {
  const unminifiedWebpackConfig = {
    ...webpackConfig,
    mode: 'development',
    optimization: {
      minimize: false,
    },
  };

  return gulp.src('./assets/js/app.js')
    .pipe(webpack(unminifiedWebpackConfig))
    .pipe(rename({ suffix: '.unmin' }))
    .pipe(gulp.dest('./dist/assets/js'))
    .pipe(browserSync.stream());
});

// Process HTML partials
gulp.task('html:partials', () => gulp.src(['*.html'])
  .pipe(fileinclude({ prefix: '@@', basepath: '@file' }))
  .pipe(htmlreplace({ 'js': 'assets/js/app.min.js', 'css': 'assets/css/app.min.css' }))
  .pipe(gulp.dest('./dist/'))
  .pipe(browserSync.stream())
);

// Copy assets to 'dist' directory excluding SCSS and app.js
gulp.task("copyAssets", () => gulp.src(['!*.html', "assets/**/*", "!assets/scss/**", "!assets/js/app.js"], { base: './' })
  .pipe(gulp.dest('dist'))
);

// Beautify HTML files
gulp.task('beautify-html', () => {
  const options = { indentSize: 2 };
  return gulp.src('dist/*.html')
    .pipe(htmlbeautify(options))
    .pipe(gulp.dest('dist/'))
});

// Main build task
gulp.task("build", gulp.series("clean", gulp.parallel('scss', 'js:webpack:minified', /*'js:webpack:unminified',*/ 'scss:copy'), 'html:partials', 'copyAssets', 'beautify-html'));

// Development task with file watcher
gulp.task('dev', gulp.series('build', function watchChanges(done) {
  browserSync.init({ server: { baseDir: "./dist" } });

  // Watch SCSS files and run the SCSS task on changes
  gulp.watch(['assets/scss/*.scss', 'assets/scss/**/*.scss', '!assets/scss/bootstrap/**'], gulp.series('scss'));

  // Process JS changes with Webpack (both minified and unminified)
  gulp.watch('assets/js/**/*.js', gulp.parallel('js:webpack:minified', /*'js:webpack:unminified'*/));

  // Process HTML on changes
  gulp.watch(['*.html', './partials/**/*.html'], gulp.series('html:partials'));

  done();
}));

// Default task - runs the build task
gulp.task("default", gulp.series("build"));
