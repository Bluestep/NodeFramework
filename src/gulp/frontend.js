var gulp = require('gulp'),
    del = require('del'),
    mainBowerFiles = require('main-bower-files'),
    rename = require("gulp-rename"),
    inject = require("gulp-inject"),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    html2js = require('gulp-html2js'),
    stylish = require('jshint-stylish'),
    jshint = require('gulp-jshint'),
    cache = require('gulp-cached');

module.exports = function(name) {

    var cleanTask = 'clean@'+name,
        jsFiles = ['app/'+name+'/**/*.js', 'app/common/**/*.js', 'src/**/'+name+'/**/*.js'],
        templatesFiles = ['src/**/'+name+'/**/*.tpl.html', './app/common/**/*.tpl.html', './app/'+name+'/**/*.tpl.html'],
        htmlFile = 'app/'+name+'/index.html',
        i18nFiles = ['app/i18n/*.json'],
        lessFiles = ['**/*.less'];

    var tasks = {
        jsFiles: function(){
            return gulp.src(jsFiles)
                .pipe(gulp.dest('dist/build/'+name+'/public/js'));
        },
        html2js: function() {
            gulp.src(templatesFiles)
                .pipe(html2js({
                    outputModuleName: 'templates'
                }))
                .pipe(concat('templates.js'))
                .pipe(gulp.dest('./dist/build/'+name+'/public/js'))
        },
        i18n: function(){
            return gulp.src(i18nFiles)
                .pipe(gulp.dest('dist/build/'+name+'/public/i18n'));
        },
        bowerFiles: function(){
            return gulp.src(mainBowerFiles(), { base: 'bower_components' })
                .pipe(gulp.dest('dist/build/'+name+'/public/js/bower_components'))
        },
        less: function(){
            gulp.src('./app/'+name+'/less/main.less')
                .pipe(less())
                .pipe(gulp.dest('./dist/build/'+name+'/public/css'));
        },
        indexHtml: function(){
            var sources = gulp.src([
                    'dist/build/'+name+'/**/bower_components/**/*.js',
                    'dist/build/'+name+'/**/*.js',
                    'dist/build/'+name+'/public/css/main.css'
            ], {read: false});


            return gulp.src(['app/'+name+'/index.html'])
                .pipe(inject(sources, {
                    ignorePath: 'dist/build/'+name
                }))
                .pipe(rename(function (path) {
                    path.basename = "main";
                }))
                .pipe(gulp.dest('dist/build/'+name));
        },
        lint: function() {
            return gulp.src(jsFiles)
                .pipe(cache('linting'))
                .pipe(jshint())
                .pipe(jshint.reporter(stylish));
        }
    };



    gulp.task('lint@'+name, tasks.lint);

    gulp.task(cleanTask, function(cb) { del(['dist/build/'+name], cb); });

    gulp.task('bower-files@'+name, [cleanTask], tasks.bowerFiles);
    //gulp.task('bower-files-watch@'+name, tasks.bowerFiles);

    gulp.task('js-files@'+name, [cleanTask], tasks.jsFiles);
    gulp.task('js-files-watch@'+name, tasks.jsFiles);

    gulp.task('html2js@'+name, [cleanTask], tasks.html2js);
    gulp.task('html2js-watch@'+name, tasks.html2js);

    gulp.task('i18n@'+name, [cleanTask], tasks.i18n);
    gulp.task('i18n-watch@'+name, tasks.i18n);

    gulp.task('less@'+name, [cleanTask], tasks.less);
    gulp.task('less-watch@'+name, tasks.less);



    gulp.task('assets@'+name, [cleanTask], function(){
        return gulp.src('app/assets/**/*')
            .pipe(gulp.dest('dist/build/'+name+'/public/assets'))
    });


    gulp.task('index.html@'+name, ['js-files@'+name, 'bower-files@'+name, 'i18n@'+name, 'less@'+name, 'html2js@'+name], tasks.indexHtml);
    gulp.task('index.html-watch@'+name, tasks.indexHtml);

    gulp.task('build@'+name, ['index.html@'+name, 'assets@'+name, 'lint@'+name], function() {
        gulp.watch(jsFiles, ['js-files-watch@'+name, 'lint@'+name]);
        gulp.watch(templatesFiles, ['html2js-watch@'+name]);
        gulp.watch(i18nFiles, ['i18n-watch@'+name]);
        gulp.watch(lessFiles, ['less-watch@'+name]);
        gulp.watch(htmlFile, ['index.html-watch@'+name])
    });
};