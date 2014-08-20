var async = require('async'),
    fse = require('fs-extra'),
    watch = require('node-watch');

var logger = require(__dirname+'/logger/logger'),
    server = require(__dirname+'/server/server'),
    config = require(__dirname+'/config/config'),
    build = require(__dirname+'/build/build');


module.exports = {
    loadEnvironment: function(params) {
        logger.clear();
        logger.info('Starting '+params.env+' environnement...', {level: 1});

        async.series([
            function(cb) {
                logger.info('Cleaning '+params.env+' environnement...', {level: 2});
                fse.remove('dist/'+config.getDestDir(params), cb);
            },
            function(cb) {
                build.build(params, cb)
            },
            function() {
                server.supervisor[params.env](params);


                watch('app', function(filename) {
                    console.log(filename, ' changed.');
                });
                watch('src', function(filename) {
                    console.log(filename, ' changed.');

                    if(server.monitor && (filename.indexOf('/sockets/') != -1 || filename.indexOf('/api/') != -1)) {
                        server.monitor.restart();
                    }
                });
            }
        ]);
    }
}