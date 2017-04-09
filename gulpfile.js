var gulp = require('gulp');
var pug  = require('gulp-pug');
var stylus = require('gulp-stylus');

gulp.task('pug', function buildHTML() {
  return gulp.src('pug/*.pug')
  .pipe(pug({
    // Your options in here. 
  }))
  .pipe(gulp.dest('html'))
});

gulp.task('stylus', function () {
  return gulp.src('stylus/*.styl')
    .pipe(stylus())
    .pipe(gulp.dest('css'));
});

gulp.task('build', ['pug', 'stylus'])