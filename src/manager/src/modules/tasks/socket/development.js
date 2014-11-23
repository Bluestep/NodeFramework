var async = require('async'),
    gulp = require('bluestorm').gulp,
    childProcess = require('child_process');


var child;
module.exports = function(socket) {


    socket.on('tasks:development:build-server', function(req, callback) {
        if (typeof callback == 'function') {
            process.env.NODE_ENV = 'development';

            if(child) {
                child.kill('SIGHUP');
            }
            child = childProcess.fork(__dirname+'/../../../../lib/gulp/development', {
                cwd: req.data.path
            });
            child.on('message', function(message){
                socket.emit('message', message);
            });
            child.send({
                debug: true
            });

            callback();
        }
    });
    socket.on('tasks:kill', function(req, callback) {
        if (typeof callback == 'function') {
            if(child) {
                child.kill('SIGHUP');
                child = null;
            } else {
                return callback('no_child');
            }

            callback();
        }
    });
    socket.on('tasks:isProcessing', function(req, callback) {
        if (typeof callback == 'function') {
            if(child) {
                callback(null, true)
            } else {
                callback(null, false)
            }
        }
    });
};