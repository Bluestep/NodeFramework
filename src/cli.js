var argv = require('yargs')
    .usage('NodeFramework command tool.\n\nUsage: $0 [command] [options]')
    .example('$0 dev', 'Load development environment.')
    .example('$0 dev --help', 'Show help for development environment.')
    .example('$0 dev -d', 'Load debug mode for development environment.')
    .example('$0 prod', 'Load production environnement.')
    .check(function(command) {
        command = command._[0];
        if(commands.indexOf(command)==-1) throw new Error('Command '+command+' not available !');
    })
    .demand(1)
    .alias('d', 'debug')
    .describe('d', 'Set output logging.')
    .alias('h', 'help')
    .describe('h', 'See help for a particular command.');

var commands = ['dev', 'prod', 'server-dev', 'server-prod'];

var server = require(__dirname+'/server/server'),
    logger = require(__dirname+'/logger/logger');

var tasksManager = require(__dirname+'/tasks/manager');


module.exports = {
    command: function(commands) {
        var command = commands._[0],
            debug = commands.debug || false;
        if(command=="dev") {
            require(__dirname+'/gulp/gulp').development(debug);
        } else if(command=="prod") {
            tasksManager.builder.build('production', function() {
                var command = 'node cli.js server-prod'
                logger.info('Type '+command+' to start the server.', {level:1});
            });

        } else if(command=="server-dev") {
            process.env.NODE_ENV = 'development';
            server.startDev(debug);

        } else if(command=="server-prod") {
            process.env.NODE_ENV = 'production';
            server.startProd(debug);


        }
    },
    argv: function() {
        return argv.argv;
    }
};