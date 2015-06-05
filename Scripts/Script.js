var _ = require('lodash');

var remote = require('./Remote.js');
var Ftp = require('../Deploy/Ftp.js');

var defaults = {
   importdir: '/c1/import'
};
var settings = {};

module.exports = function(options) {
   settings = _.merge({}, defaults, options);
   var ftp = new Ftp(settings);
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
            }))
            .then(function(conn) {
               console.log('COMPILED CHECKING RESULTS');
               console.log(scripts);
               scripts.forEach(function(script) {
                  var path = settings.sysname + '/W/' + script + '.log';
                  var cmd = 'grep ERRLINE ' + path;
                  remote.execute(settings.connect, cmd)
                  .then(function(conn) {
                     cmd = 'rm ' + path
                     return remote.execute(settings.connect, cmd);
                  });
               });
            });
         //);
      },
      import: {
         dst: function(dstfile) {
            return ftp.push(dstfile, settings.importdir)
            .then(function(filename) {
               return remote.runscript(
                  settings.connect,
                  settings.sysname,
                  settings.parm_path.remote,
                  settings.cron.user,
                  settings.cron.pass,
                  [{name: 'import-dsts', 
                     args: [settings.importdir + '/' + filename]
                  }]
               );
            });
         }

      }
   };
};
