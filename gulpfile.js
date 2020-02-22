var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('./src/tsconfig.json');

gulp.task('scripts', function() {
    return gulp.src('./src/**/*.ts')
        .pipe(tsProject())
		.js.pipe(gulp.dest('./release/js'));
});

gulp.task('watch', gulp.series('scripts', function() {
    gulp.watch('./src/**/*.ts', ['scripts']);
}));

gulp.task('default', gulp.series('watch'));
