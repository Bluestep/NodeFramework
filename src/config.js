var domains = require(process.cwd()+'/config/domains.json'),
    mainConfig = require(process.cwd()+'/config/main.json'),
    dbConfig = require(process.cwd() + '/config/database.json');



module.exports = {
    frontend: {
        list: function() {
            var res = [];
            for (var key in domains['development']) {
                if(key!='api'&&key!='socket'&&key!='upload')
                res.push(key);
            }
            return res;
        },
        angularVersion: mainConfig.angularVersion ? mainConfig.angularVersion :'1.3'
    },
    get: function(env, name) {
        return domains[env][name];
    },
    isSsl: function () {
        if (mainConfig.ssl) return true;

        return false;
    },
    main: {
        get: function (name) {
            return mainConfig[name];
        },
        isSeo: function (name) {
            var configSeo = this.get('seo');
            if(typeof configSeo=='object'&& configSeo.length && configSeo.indexOf(name)!=-1) {
                return true;
            } else {
                return false;
            }
        }
    },
    redis: {
      getConfig: function () {
        var host = dbConfig.redis && dbConfig.redis.host ? dbConfig.redis.host : 'localhost',
            port = dbConfig.redis && dbConfig.redis.port ? dbConfig.redis.port : 6379;
        return {
          host: host,
          port: port
        }
      }
    }
};
