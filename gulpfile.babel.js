// generated on 2015-10-12 using generator-gulp-webapp 1.0.3
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {
    stream as wiredep
}
from 'wiredep';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const config = {
    src: 'app/',
    dist: 'dist/',
    cssSrc: [
        'app/{styles,css}/{,*/}*.scss',
        '!app/{styles,css}/_*/*'
    ]
}

//排除非当前项目的编译
let excludeFile = 'black_five,1212,hot,pk,gwj';

gulp.task('styles', () => {
    return gulp.src(config.cssSrc)
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.']
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer({
            browsers: ['last 2 version']
        }))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('.tmp/'))
        .pipe(reload({
            stream: true
        }));
});

function lint(files, options) {
    return () => {
        return gulp.src(files)
            .pipe(reload({
                stream: true,
                once: true
            }))
            //.pipe($.eslint(options))
            //.pipe($.eslint.format())
            .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
    };
}
const testLintOptions = {
    env: {
        mocha: true
    }
};

gulp.task('lint', lint('app/scripts/{,*/}*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

gulp.task('html', ['styles'], () => {
    const assets = $.useref.assets({
        searchPath: ['.tmp', 'app', '.']
    });

    return gulp.src(['app/{,*/}*.html','!app/{'+excludeFile+'}/*.html'])
        .pipe(assets)
        .pipe($.rev())
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.minifyCss({
            compatibility: '*'
        })))
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe($.if('*.html', $.minifyHtml({
            conditionals: true,
            loose: true
        })))
        .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
    return gulp.src('app/images/**/*')
        .pipe($.if($.if.isFile, $.cache($.imagemin({
                progressive: true,
                interlaced: true,
                // don't remove IDs from SVGs, they are often used
                // as hooks for embedding and styling
                svgoPlugins: [{
                    cleanupIDs: false
                }]
            }))
            .on('error', function(err) {
                console.log(err);
                this.end();
            })))
        .pipe($.rev())
        .pipe(gulp.dest('dist/images'))
        .pipe($.rev.manifest())
        .pipe(gulp.dest('dist/rev/images'))
});

gulp.task('fonts', () => {
    return gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('.tmp/fonts'))
        .pipe($.rev())
        .pipe(gulp.dest('dist/fonts'))
        .pipe($.rev.manifest())
        .pipe(gulp.dest('dist/rev/fonts'))
});

gulp.task('extras', () => {
    return gulp.src([
        'app/*.*',
        '!app/*.html'
    ], {
        dot: true
    }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles', 'fonts'], () => {
    browserSync({
        notify: false,
        port: 9004,
        open: false,
        server: {
            baseDir: ['.tmp', 'app'],
            routes: {
                '/bower_components': 'bower_components'
            }
        }
    });

    gulp.watch([
        'app/{**,*}/*.html',
        'app/scripts/**/*.js',
        'app/images/**/*',
        '.tmp/fonts/**/*'
    ]).on('change', reload);

    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/fonts/**/*', ['fonts']);
    gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', () => {
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['dist']
        }
    });
});

gulp.task('serve:test', () => {
    browserSync({
        notify: false,
        port: 9000,
        ui: false,
        server: {
            baseDir: 'test',
            routes: {
                '/bower_components': 'bower_components'
            }
        }
    });

    gulp.watch('test/spec/**/*.js').on('change', reload);
    gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {
    gulp.src(['app/styles/{**,*}.scss','!app/{'+excludeFile+'}/*.scss'])
        .pipe(wiredep({
            ignorePath: /^(\.\.\/)+/
        }))
        .pipe(gulp.dest('app/styles'));

    gulp.src('app/{,*/}*.html')
        .pipe(wiredep({
            ignorePath: /^(\.\.\/)*\.\./
        }))
        .pipe(gulp.dest('app'));
});

gulp.task('rev', () => {
    return gulp.src(['dist/rev/**/*.json', 'dist/styles/{,*/}*'])
        .pipe($.revCollector())
        .pipe(gulp.dest('dist/styles'));
});

gulp.task('build', ['lint', 'fonts', 'extras', 'html'], () => {
    return gulp.src('dist/**/*').pipe($.size({
        title: 'build',
        gzip: true
    })).on('end', () => {
        gulp.start('rev');
    });


});

gulp.task('default', ['clean'], () => {
    gulp.start('build');
});
