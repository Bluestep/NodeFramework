var statics = require(__dirname+'/statics/statics'),
    api = require(__dirname+'/api/api'),
    socket = require(__dirname+'/socket/socket'),
    logger = require(__dirname+'/../logger/logger'),
    db = require(__dirname+'/../db/db'),
    config = require(__dirname+'/../config');


var express = require('express'),
    forever = require('forever-monitor'),
    vhost = require('vhost'),
    fs = require('fs');

var sticky = require(__dirname+'/sticky-session');

var frontendApps = config.frontend.list();


module.exports = {
    startDev: function(debug) {
        frontendApps.forEach(function(name) {

            var app = config.get('development', name);
            statics({
                port: app,
                name: name,
                debug: debug
            });
        });

        api({ port: config.get('development', 'api'), debug: debug });
        socket({ port: config.get('development', 'socket'), debug: debug });

        logger.log('Forever started.');
        logger.log('Webapp is online (development).');
        fs.writeFile('dist/build/livereload.log', Math.random()+"");
    },
    startProd: function(debug) {
        sticky(function() {
            var server = express();


            frontendApps.forEach(function(name) {

                var app = statics({
                    name: name,
                    debug: debug
                });
                server.use(vhost(config.get('production', name), app))
            });


            var apiApp = api({ debug: debug }),
                socketApp = socket({ debug: debug });

            server.use(vhost(config.get('production', 'socket'), socketApp))
                .use(vhost(config.get('production', 'api'), apiApp));

            return server.listen(3333);

        }).listen(config.get('production', 'main'), function() {
            if(process.env.NODE_WORKER_ID=='MASTER') {
                logger.log('Master started on ', config.get('production', 'main'), ['red'], ' port');
            } else {
                logger.log('Worker ' + process.env.NODE_WORKER_ID+ ' started');
            }

        });
    },
    supervisor: {
        development: function(debug) {
            var options = ['server-dev'];
            if(debug) options.push('-d');
            server.supervisor.load({
                max: 1,
                command: 'node',
                env: {'NODE_ENV': 'development'},
                watch: false,
                options: options
            });
        },
        load: function(options) {
            server.monitor = new (forever.Monitor)('cli.js', options);

            server.monitor.on('error', function (err) {
                logger.error(err, 'Forever');
            });
            server.monitor.on('start', function () {
                logger.log('Forever starting...');
            });
            server.monitor.on('stop', function () {
                logger.log('Forever stopped.');
                logger.log('Webapp is offline.');
            });

            server.monitor.on('restart', function () {
                logger.log('Forever restarting...');
            });

            server.monitor.on('exit', function () {
                logger.error(new Error('server.js has exited after '+(options.max-1)+' restarts', 'Forever'), {
                    stack: false
                });
            });

            server.monitor.start();
        },
        monitor: null
    }
};
var server = module.exports;