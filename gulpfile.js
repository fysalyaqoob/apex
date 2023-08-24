"use strict";

const gulp = require('gulp'),
  sass = require('gulp-sass')(require('sass')),
  del = require('del'),
  //cleanCSS = require('gulp-clean-css'),
  //gulpif = require('gulp-if'),
  //sourcemaps = require('gulp-sourcemaps'),
  path = require('path'),
  rename = require("gulp-rename"),
  autoprefixer = require('gulp-autoprefixer'),
  fileinclude = require('gulp-file-include'),
  htmlbeautify = require('gulp-html-beautify'),
  webpack = require('webpack-stream'),
  TerserPlugin = require('terser-webpack-plugin'),
  exec = require('child_process').exec,
  fs = require('fs'),
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
    //.pipe(cleanCSS())
    .pipe(rename(function (path) {
      //path.basename += '.min';
    }))
    .pipe(gulp.dest('./dist/assets/css'))
    .pipe(browserSync.stream());
});

const webpackConfig = {
  mode: 'production', // Set mode to production only
  entry: {
    app: './assets/js/app.js' // Entry point for webpack
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
    minimize: true, // Always minimize
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
};

const webpackConfigUnminified = {
  mode: 'development', // Set mode to development for non-minified output
  entry: {
    bootstrap: 'bootstrap/dist/js/bootstrap.bundle.js',  // This includes Bootstrap's JavaScript and Popper
    jquery: 'jquery/dist/jquery.js'
  },
  output: {
    filename: '[name].js'
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
    minimize: false, // Do not minimize
  },
};

// JS: Webpack (unminified)
gulp.task('js:webpack:unminified', () => {
  return gulp.src('./assets/js/*.js') 
    .pipe(webpack(webpackConfigUnminified))
    .pipe(gulp.dest('./dist/assets/js'))
    .pipe(browserSync.stream());
});

// JS: Webpack (minified)
gulp.task('js:webpack:minified', () => {
  return gulp.src('./assets/js/app.js')
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest('./dist/assets/js'))
    .pipe(browserSync.stream());
});

// Process HTML partials
gulp.task('html:partials', () => gulp.src(['*.html'])
  .pipe(fileinclude({ prefix: '@@', basepath: '@file' }))
  .pipe(gulp.dest('./dist/'))
  .pipe(browserSync.stream())
);

gulp.task('optimize-videos', function(done) {
  const videosPath = './assets/video/';
  const outputDir = './dist/assets/video/';

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.readdir(videosPath, (err, files) => {
      if (err) {
          console.error('Error reading directory:', err);
          return done();
      }

      const mp4Files = files.filter(file => path.extname(file) === '.mp4');
      
      if (mp4Files.length === 0) {
          console.log('No .mp4 files found');
          return done();
      }

      let processedCount = 0;

      mp4Files.forEach(file => {
          const inputPath = path.join(videosPath, file);
          const outputPath = path.join(outputDir, file); // Keep the original filename, just change the directory
          
          exec(`ffmpeg -i ${inputPath} -c:v libx264 -crf 23 -c:a aac -strict experimental -b:a 192k -movflags +faststart ${outputPath}`, (err, stdout, stderr) => {
              if (err) {
                  console.error('Failed to optimize video:', file, err);
              } else {
                  console.log(`Optimized video: ${file}`);
              }

              processedCount++;

              if (processedCount === mp4Files.length) {
                  done();
              }
          });
      });
  });
});


// Copy assets to 'dist' directory excluding SCSS and app.js
gulp.task("copyAssets", () => gulp.src(['!*.html', "assets/**/*", "!assets/scss/**", "!assets/video/**"], { base: './' })
  .pipe(gulp.dest('dist'))
);

// Beautify HTML files
gulp.task('beautify-html', () => {
  const options = { indentSize: 2 };
  return gulp.src('dist/*.html')
    .pipe(htmlbeautify(options))
    .pipe(gulp.dest('dist/'))
});

// Update Main build task
gulp.task("build", gulp.series("clean", gulp.parallel('scss'), 'html:partials', 'copyAssets', 'beautify-html', 'optimize-videos'));

// Development task with file watcher
gulp.task('dev', gulp.series('build', function watchChanges(done) {
  browserSync.init({ server: { baseDir: "./dist" } });

  // Watch SCSS files and run the SCSS task on changes
  gulp.watch(['assets/scss/*.scss', 'assets/scss/**/*.scss', '!assets/scss/bootstrap/**'], gulp.series('scss'))
    .on('change', browserSync.reload); // Reload browser on SCSS changes

  // Process JS changes with Webpack (minified only)
  gulp.watch('assets/js/**/*.js', gulp.parallel('js:webpack:minified'))
    .on('change', browserSync.reload); // Reload browser on JS changes

  // Process HTML on changes
  gulp.watch(['*.html', './partials/**/*.html'], gulp.series('html:partials'))
    .on('change', browserSync.reload); // Reload browser on HTML changes

  // Additional watcher to optimize videos when an .mp4 file is added/changed
  gulp.watch('assets/**/**/*.mp4', gulp.series('optimize-videos'))
    .on('change', browserSync.reload); // Reload browser on .mp4 changes

  done();
}));

// Default task - runs the build task
gulp.task("default", gulp.series("build"));
