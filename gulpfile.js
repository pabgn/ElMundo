var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var uglify = require('gulp-uglify');

var paths = {
  sass: ['./scss/**/*.scss'],
  less: ['./less/**/*.less'],
  js: ['./src/**/*.js']
};

gulp.task('default', ['sass', 'less', 'js']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('less', function (done) {
  gulp.src(paths.less)
    .pipe(less())
    .pipe(minifyCss({keepSpecialComments: 0}))
    .pipe(gulp.dest('./www/css/'))
    .pipe(rename({extname : '.min.css'}))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('js', function () {
  gulp.src(paths.js)
    .pipe(uglify())
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest('./www/js/'));
});

gulp.task('server', function () {
  sh.exec('http-server www/');
});

gulp.task('watch_sass', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('watch_less', function() {
  gulp.watch(paths.less, ['less']);
});

gulp.task('watch_js', function() {
  gulp.watch(paths.js, ['js']);
});

gulp.task('watch', ['sass', 'less', 'js', 'watch_sass', 'watch_less', 'watch_js', 'server']);

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
