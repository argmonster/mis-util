var fs = require('fs');
var Q = require('q');
var ftp = require('ftp');

var get_source_files = require('./get_source_files.js');
var clean_file_list = require('./clean_file_list.js');

var Mis_ftp = function(options)  {

   this.settings = options;
   this.f = new ftp();
};

Mis_ftp.prototype = {

   connect : function connect(connectoptions) {
      var dfd = Q.defer();
      var self = this;
      self.f.on('ready', dfd.resolve);
      self.f.connect(connnectoptions);
      return dfd.promise;
   },

   check_remote_path : function check_remote_path(path) {
      var dfd = Q.defer();
      var self = this;
      self.f.cwd(path, function(err, dir) {
         if (err) { 
            dfd.reject(new Error(err));
         }
         dfd.resolve(dir)
      });
      return dfd.promise;
   },

   make_remote_path : function make_report_path(path) {
      var dfd = Q.defer();
      var self = this;
      self.f.mkdir(path, true, dfd.resolve);
      return dfd.promise;
   },

   push : function push(local_file, remote_dir) {
      var dfd = Q.defer();
      var self = this;

      var filename = local_file.split('/').pop();

      console.log(remote_dir);
      self.check_remote_path(remote_dir)
      .then(function() {
         console.log('putting file: ', local_file, remote_dir, filename.replace(/\.[^.]*$/, ''));
         self.f.put(local_file, remote_dir + filename.replace(/\.[^.]*$/, ''), function(err) { 
            if (err) { console.log(err); dfd.reject(err); }
            dfd.resolve();
         });
      })
      .fail(
         function(err) { 
            console.log('fail', err);
            dfd.reject(err);
      });
      return dfd.promise;
   },

   push_dir : function(local, remote, extension) {

      var dfd = Q.defer();
      var self = this;

      get_source_files(local)
      .then(function(files) { 
         var list = clean_file_list(files, extension);

         self.f.on('ready', function() {
            console.log('connected, pushing files to: ' + remote);
            var pushed = list.map(function(file) {
               console.log(local + file);
               console.log(self.settings.sysname, ' remote: ', remote);
               return self.push(local + file, self.settings.sysname + remote);
            });

            Q.when(pushed).then(function() {
               console.log('Push Complete');
               self.f.end();
            });
         });
         self.f.connect(self.settings.connect);
         dfd.resolve();
      });

      return dfd.promise;
   }
};

module.exports = Mis_ftp;
