var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('bundle-js', function() {
  return browserify('src/client.js')
    .bundle()
    .pipe(source('client.js'))
    .pipe(gulp.dest('app/js'));
});

gulp.task('default', ['bundle-js']);
