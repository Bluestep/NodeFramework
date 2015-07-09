var async = require('async'),
    mongoose = require('mongoose');

var logger = require(__dirname+'/src/logger/logger'),
    server = require(__dirname+'/src/server/server'),
    cli = require(__dirname+'/src/cli'),
    arborescence = require(__dirname+'/src/arborescence'),
    upload = require(__dirname + '/src/upload/upload'),
    hipchat = require(__dirname + '/ssrrcc/connectors/hipchat/hipchat');

module.exports = {
    cli: cli,
    server: server,
    logger: logger,
    upload: upload,
    hipchat: hipchat,
    db: function(callback) {
        require(__dirname + '/db')(function(err, res) {
            if (err)
                return callback(err);

            return callback(res.db);
        });
    },
    mongo: function(callback) {
        require(__dirname + '/mongo')(callback);
    },
    user: require(__dirname + '/src/server/user/models/user'),
    userSchema: function(fields) {
        if (typeof fields == 'function') {
            callback = fields;
            fields = null;
        }

        var Schema = mongoose.Schema;
        var defaultsFields = {
            "email": String,
            "password": String,
            "role": String,
            "activated": {type: Boolean, default: false}
        };
        if (fields) {
            for (var i in fields) {
                if (fields.hasOwnProperty(i)) {
                    defaultsFields[i] = fields[i];
                }
            }
        }
        return new Schema(defaultsFields);
    },
    mongoose: mongoose,
    mailer: require(__dirname + '/src/email/mailer')
};

require(__dirname + '/src/db/returnmongoose');

require(__dirname + '/db')(function(err, res) {
    if (res.type == 'mongoose') {
        console.log('A');
        arborescence.getRequiredFiles('models', function (files) {
            console.log('B');
            arborescence.loadFiles(files, null, function () {
                console.log('C');
            });
        });
    }
});