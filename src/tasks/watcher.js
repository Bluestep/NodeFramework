var watch = require('node-watch'),
    fs = require('fs'),
    async = require('async');

var logger = require(__dirname+'/../logger/logger'),
    tasksContainer = require(__dirname+'/tasksContainer'),
    server = require(__dirname+'/../server/server')
    builder = require(__dirname+'/builder'),
    livereload = require(__dirname+'/livereload');

//TODOFRAM
var excluded = ['app/tasks'];

module.exports = {
    watch: function() {
        logger.info('And now my Watch begins.', {level:2})
        watch(['src', 'app'], function(filename) {
            var emit = true;
            excluded.forEach(function(exclude) {
                if(filename.indexOf(exclude)!=-1) {
                    emit=false;
                }
            });
            if(emit) watcher.onWatch(filename);
        });
    },
    onWatch: function(filename) {
        if(server.monitor && (filename.indexOf('src/')!=-1 && (filename.indexOf('/sockets/') != -1 || filename.indexOf('/api/') != -1))) {
            server.monitor.restart();
            return;
        }


        var config = tasksContainer.getWatchConfig(getExtension(filename));
        if(!config) return console.log('No watch for '+filename);
        //get tasks
        var updates = [],
            deletes = [];
        if(config.updatedelete) {
            config.updatedelete.forEach(function(task) {
                updates.push(task);
                deletes.push(task);
            });
        }

        fs.exists(filename, function(exists) {
            //if it doesn't exist, load a watch : on delete
            var tasks,
                message = 'File '+filename;
            if(!exists) {
                tasks = deletes;
                message+=' deleted.';
            } else {
                tasks = updates;
                message+=' updated.';
            }
            logger.info(message, {level:2});

            async.each(tasks, function(task, cb) {
                task.filename = filename;
                if(!task.dir || filename.indexOf(task.dir)==0)//we check the dir var
                    builder.load(task, 'development', cb);
            }, function() {
                logger.info('Done.', {level:2});
                livereload.reload();
            });
        });

    }
};
var watcher = module.exports;



var getExtension = function (filename) {
    var name = filename.slice(filename.lastIndexOf('/'));
    return name.slice(name.indexOf('.')+1);
}