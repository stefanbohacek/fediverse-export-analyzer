const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const babelify = require('babelify');
const browserify = require('browserify');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const fs = require('fs');
const gulp = require('gulp');
const gutil = require('gulp-util');
const jshint = require('gulp-jshint');
const less = require('gulp-less');
const merge = require('merge-stream');
const minifycss = require('gulp-minify-css');
const path = require('path');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('node-sass'));
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const streamify = require('gulp-streamify');
const stylish = require('jshint-stylish');
const uglify = require('gulp-uglify');

function swallowError(error) {
    console.log(error.toString());
    this.emit('end');
}

function compileStyles(){
    return gulp.src('src/styles/*.scss')
    .pipe(sass({
        paths: [ path.join(__dirname, 'scss', 'includes') ]
    }))
    .on('error', swallowError)
    .pipe(autoprefixer('last 3 version', 'android >= 3', { cascade: true }))
    .on('error', swallowError)
    .pipe(gulp.dest('public/css/', { mode: 0o777 }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .on('error', swallowError)
    .pipe(gulp.dest('public/css/', { mode: 0o777 }))
    // .pipe(reload({stream:true}));
} 

function compileScripts(){
    return gulp.src('src/scripts/**/*.js')
    .pipe(sourcemaps.init({compress: false}))
    // .pipe(babel({
    //     presets: ['@babel/preset-env']
    // }))
    .on('error', swallowError)
    // .pipe(concat('scripts.js'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/js', {mode: 0o777}));
}

function watch(){
    gulp.watch('./src/styles/**/*.*', gulp.series('styles'));
    gulp.watch('./src/scripts/**/*.*', gulp.series('jslint', 'scripts'));    
}

function jslint(){
    return gulp.src('src/scripts/**/*.js')
    .pipe(jshint('tests/.jshintrc'))
    .on('error', gutil.noop)
    .pipe(jshint.reporter(stylish))
    .on('error', swallowError);
}

gulp.task('styles', gulp.series(compileStyles));
gulp.task('scripts', gulp.series(compileScripts));
gulp.task('jslint', gulp.series(jslint));
gulp.task('watch', gulp.series(watch));
gulp.task('default', gulp.series('styles', 'scripts', 'watch'));
