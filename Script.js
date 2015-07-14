var _ = require('lodash');
var q = require('q');

var remote = require('./libs/Remote.js');
var Ftp = require('./libs/Ftp.js');

var defaults = {
   importdir: '/c1/import',
   dstscript: './usc/import-dsts.usc',
   compilescript: './usc/compile'
};
var settings = {};

module.exports = function(options) {
   settings = _.merge({}, defaults, options);
   var ftp = new Ftp(settings);
   var api = {
      install: function(script) { 
         console.log('Installing', script);
         return ftp.push(script, [
            settings.sysname,
            settings.usc_path.remote
            ].join(''))
         .then(function(usc) { 
            console.log('COMPILING::', usc);
            return api.installexecutable(settings.compilescript)
            .then(function(compilescript) {
               return api.compile([usc])
               .then(function() {
                  return api.uninstallexecutable(compilescript);
               });
            })
            .then(function() {return q(usc)});
         })
         .then(function(usc) {
            console.log("COMPILE COMPLETE", usc);
            return q(usc);
         });
      },
      installexecutable: function(file) {
         console.log('Installing Object Code', file);
         return ftp.push(file, [
            settings.sysname,
            settings.usc_path.remote.replace(/\/S$/, '/O/')
            ].join(''));
      },
      uninstallexecutable: function(file) {
         console.log('UnInstalling Object Code', file);
         return remote.removefile(
            settings.connect,
            settings.sysname,
            settings.usc_path.remote.replace(/\/S$/, '/O'),
            file);
      },
      uninstall: function(script) {
         console.log('Uninstalling ', script);
         var cmd = [
            "rm ",
            settings.sysname,
            settings.usc_path.remote,
            "/", 
            script,
            ' ',
            settings.sysname,
            settings.usc_path.remote.replace(/\/S$/,'/O'),
            '/',
            script
         ].join('');
         return remote.execute(settings.connect, cmd);
      },
      run: remote.runscript.bind(remote, 
         settings.connect,
         settings.sysname, 
         settings.parm_path.remote,
         settings.cron.user, 
         settings.cron.pass),

      runonce: function(script, scriptargs) {
         scriptargs = scriptargs || [];
         return api.install(script)
         .then(function(usc) { 
            return api.run([{name: usc, args: scriptargs}])
            .then(function() {
               api.uninstall(usc)
            });
         })
      },
      compile: function(scripts) { 
         return api.run(
         scripts.map(function(script) {
            console.log('mapping: ', script);
            return {name: 'compile', args: [script]};
         }))
         .then(function(conn) {
            console.log('COMPILED CHECKING RESULTS');
            console.log(scripts);
            return q.all(scripts.map(function(script) {
               var path = [
                  settings.sysname,
                  '/W/',
                  script,
                  '.log'
                  ].join('');
               var cmd = [
                  'grep ERRLINE',
                  path
                  ].join(' ');
               return remote.execute(settings.connect, cmd)
               .then(function(conn) {
                  cmd = [
                     'rm',
                     path
                  ].join(' '); 
                  return remote.execute(settings.connect, cmd);
               });
            }));
         });
      },
      import: {
         dst: function(dstfile) {
            return ftp.push(dstfile, settings.importdir)
            .then(function(filename) {
               return api.runonce(settings.dstscript, [ 
                  [settings.importdir, filename].join('/')
               ])
               .then(function() {
                  var cmd = [
                     "rm ",
                     settings.importdir,
                     "/",
                     filename
                  ].join('');
                  return remote.execute(settings.connect, cmd);
               })
            })
         }
      }
   };
   return api;
};
