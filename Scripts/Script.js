var _ = require('lodash');

var remote = require('./Remote.js');

var defaults = {};
var settings = {};

module.exports = function(options) {
   settings = _.merge({}, defaults, options);
   return {
      run: remote.runscript.bind(remote, 
         settings.connect,
         settings.sysname, 
         settings.parm_path.remote,
         settings.cron.user, 
         settings.cron.pass),
      compile: function(scripts) { 
         return remote.runscript(
            settings.connect,
            settings.sysname, 
            settings.parm_path.remote,
            settings.cron.user, 
            settings.cron.pass, 
            scripts.map(function(script) {
               return {name: 'compile', args: [script]};
            })
         );
      }
   };
};
