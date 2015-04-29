var Client = require('ssh2').Client;
var Q = require('q');


var connect = function connect(settings) {
   var dfd = Q.defer();
   var conn = new Client();
   console.log('connecting to ' + settings.host);
   conn.on('ready', function() {
      console.log('connected');
      dfd.resolve(conn);
   })
   .on('error', function(err) {
      dfd.reject(err);
   })
   .connect(settings);
   return dfd.promise;
};

var execute = function execute(conn, cmd) {
   var dfd = Q.defer();
   console.log('executing ' + cmd);
   conn.exec(cmd, function(err, stdout) {
      if (err) { return Q.reject(err); }
      stdout.on('close', function() {
         dfd.resolve(conn);
      });
   });
   return dfd.promise;
};

var put_script_parm = function put_script_parm(conn, sysname, parmpath, script) {
   console.log('creating temp parm');
   var dfd = Q.defer();
   script.args = script.args instanceof Array ? script.args : 
      script.args ? [script.args] : [];
   var parmline = "SCRIPT " + script.name + " (" + script.args.join(',') + ")";
   console.log(parmline);
   var parmname = "MU" + (Math.floor(Math.random() * 900000) + 100000); 
   var fullpath = sysname + parmpath + "/" + parmname;
   console.log(fullpath);
   var parmcmd = "echo \"" + parmline + "\" > " + fullpath;
   console.log(parmcmd);
   execute(conn, parmcmd)
   .then(function() { 
      dfd.resolve(parmname);
   });
   return dfd.promise;
};

var rm_script_parm = function rm_script_parm(conn, sysname, parmpath, parmname) {
   var cmd = "rm " + sysname + parmpath + "/" + parmname;
   return execute(conn, cmd);
};

var exec_uscript = function exec_uscript(conn, sysname, cronuser, cronpass, parm) {
   var cmd = [
      "/usr/lib/mis/bin/MIS__CRON",
      "USCRIPTX",
      "/usr/lib/mis/PROG",
      sysname,
      parm,
      cronuser,
      cronpass,
      '&'
   ].join(' ');
   console.log(cmd);
   return execute(conn, cmd);
};

var close = function close(conn) {
   return Q(conn.end());
};

module.exports = {
   execute: function(connectsettings, cmd) {
      return connect(connectsettings)
      .then(function(conn) {
         return execute(conn, cmd);
      })
      .then(function(conn) {
         return close(conn);
      })
   },
   runscript: function(connectsettings, sysname, parmpath, user, pass, scripts) {
      scripts = scripts instanceof Array ? scripts : [scripts];
      return connect(connectsettings)
      .then(function(conn) {
         console.log('setting up script parms');
         return scripts.map(function(scriptobj) {
            return put_script_parm(conn, sysname, parmpath, scriptobj)
            .then(function(parm) {
               console.log('execute parm ', parm);
               return exec_uscript(conn, sysname, user, pass, parm)
               .then(function(conn) {
                  return rm_script_parm(conn, sysname, parmpath, parm);
               });
            });
         });
      })
      .spread(function(conn) { 
         return Q(conn);
      })
      .then(function(conn) {
         console.log('closing connection');
         return close(conn);
      })
      return;
   }
};
