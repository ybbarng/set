var gulp = require('gulp');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

gulp.task('bundle-js', function() {
  return browserify('src/client.js')
    .bundle()
    .pipe(source('client.js'))
    .pipe(buffer())
    .pipe(babel({presets: ['es2015']}))
    .pipe(uglify().on('error', function(e) {
      console.log(e);
    }))
    .pipe(gulp.dest('app/js'));
});

gulp.task('default', ['bundle-js']);