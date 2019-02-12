var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');

var tsProject = ts.createProject('./src/tsconfig.json');

gulp.task('scripts', function() {
    var tsResult = gulp.src('src/*.ts')
        .pipe(tsProject());

    return merge([ // Merge the two output streams, so this task is finished when the IO of both operations are done.
        tsResult.dts.pipe(gulp.dest('./release/definitions')),
        tsResult.js.pipe(gulp.dest('./release/js'))
    ]);
});

gulp.task('watch', gulp.series('scripts', function() {
    gulp.watch('./src/**.ts', ['scripts']);
}));

gulp.task('default', gulp.series('watch'));
