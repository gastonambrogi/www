var gulp = require('gulp');
var debug = require('gulp-debug');
var fs = require('fs');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var sass = require('gulp-ruby-sass');
var rev = require('gulp-rev');

var handlebarOpts = {
  helpers: {
    assetPath: function (path, context) {
      var typeAndFile = path.split('/');
      return ['assets'+ '/' + typeAndFile[0], context.data.root[typeAndFile[1]]].join('/');
    }
  }

};

gulp.task('compile',['scripts', 'sass'], function () {
  var manifest = JSON.parse(fs.readFileSync('dist/manifest', 'utf8'));
  return gulp.src('src/html/*.hbs')
      .pipe(handlebars(manifest, handlebarOpts))
      .pipe(rename(function(path) {
        path.extname = '.html'
      }))
      .pipe(gulp.dest('dist'));
});

gulp.task('move-statics', function () {
  gulp.src('src/html/robots.txt')
      .pipe(gulp.dest('dist'))
  gulp.src('src/images/favicon.*')
      .pipe(gulp.dest('dist'));
  gulp.src('src/images/**')
      .pipe(gulp.dest('dist/assets/images'));
});

gulp.task('scripts',  function () {
  return gulp.src('src/js/*.js')
    .pipe(uglify())
    .pipe(debug())
    .pipe(rev())
    .pipe(gulp.dest('dist/assets/js'))
      .pipe(rev.manifest('dist/manifest',{
      base: 'assets',
      merge: true
    }))
    .pipe(gulp.dest('dist'))
});


gulp.task('sass', function () {
  return sass('./src/scss/',{
      debugInfo : true,
      lineNumbers: true,
      style : 'compressed'
    })
    .pipe(rev())
    .pipe(gulp.dest('./dist/assets/css'))
    .pipe(rev.manifest('dist/manifest',{
      base: 'assets',
      merge: true
    }))
    .pipe(gulp.dest('dist'))
});

gulp.task('watch', function () {
  gulp.watch('src/js/*.js', ['scripts']);
  gulp.watch('src/scss/*.scss', ['sass']);
});

gulp.task('dev', ['scripts','sass', 'watch', 'compile']);
gulp.task('build', ['scripts','sass', 'compile', 'move-statics']);
gulp.task('deploy', ['scripts','sass', 'compile']);


