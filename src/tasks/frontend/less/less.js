var util = require('util'),
    fs = require('fs'),
    async = require('async'),
    mkdirp = require('mkdirp'),
    recursive = require('recursive-readdir'),
    less = require('less');

var logger = require(__dirname+'/../../../logger/logger');



var apps = ['desktop', 'admin'];


module.exports = {
    build: function(env, cb) {
        async.each(apps, function(app, cb) {
            service.buildFile(env, app, cb);
        }, cb);
    },
    buildFile: function(env, appName, cb) {

        var dir = 'build',
            paramsLess = { compress: false };
        if(env=='production') {
            dir = 'bin';
            paramsLess = { cleancss: true };
        }
        var basePath = 'dist/'+dir+'/'+appName+'/public';



        var parser = new(less.Parser)({
            paths: ['app/theme/theme-blue'], // search @import directives
            filename: 'app/'+appName+'/less/main.less' // Specify a filename, for better error messages
        });

        async.series([
            function(cb) {
                mkdirp(basePath, cb);
            },
            function(cb) {

                parser.parse(fs.readFileSync('app/'+appName+'/less/main.less').toString(), function (e, tree) {
                    fs.writeFile(basePath+'/main.css', tree.toCSS(paramsLess), function(err) {
                        if(err) return cb(err);
                        logger.info('LESS done ('+appName+').', {level:3});
                        cb();
                    });
                });
            }
        ], cb)



    }

};
var service = module.exports;