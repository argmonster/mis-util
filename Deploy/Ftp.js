var fs = require('fs');
var Q = require('q');
var ftp = require('ftp');

var get_source_files = require('./get_source_files.js');
var clean_file_list = require('./clean_file_list.js');


var check_remote_path = function check_remote_path(f, path) {
   var dfd = Q.defer();
   f.cwd(path, function(err, dir) {
      if (err) { 
         dfd.reject(err);
      }
      dfd.resolve(dir)
   });
   return dfd.promise;
};


var make_remote_path = function make_report_path(f, path) {
   var dfd = Q.defer();
   f.mkdir(path, true, dfd.resolve);
   return dfd.promise;
};

var connect = function connect(connectoptions) {
   var dfd = Q.defer();
   var f = new ftp();
   f.on('ready', function() {
      dfd.resolve(f);
   });
   f.on('error', function(err) {
      dfd.reject(err);
   });
   console.log('connecting to', connectoptions.host, 'as', connectoptions.user);
   f.connect(connectoptions);
   return dfd.promise;
};

var put = function put(f, local_file, remote_dir, filename) {
   console.log('putting file: ', local_file, 
      'to', remote_dir, 
      'as', filename);

   var dfd = Q.defer();

   check_remote_path(f, remote_dir)
   
   .then(function() {

      f.put(local_file, filename, function(err) { 
         if (err) { 
            console.log(err); 
            dfd.reject(err); 
         }
         dfd.resolve();
      });

   }).fail(function(err) { 
      return dfd.reject(err);
   });
   
   return dfd.promise;
};

var removeExtension = function(name) {
   return name.substr(0, name.lastIndexOf('.')) || name;
};

var Mis_ftp = function(options)  {
   this.settings = options;
};

Mis_ftp.prototype = {


   push : function push(local_file, remote_dir) {
      var dfd = Q.defer();
      var self = this;
      var f;

      var filename = local_file.split('/')
         .pop();

      filename = removeExtension(filename); 

      connect(this.settings.connect, filename)
      .fail(function(err) {
         console.log('connection fail' , err);
      })
      .then(function(conn) {
         f = conn;
         console.log('call put ', filename, f.connected);
         return put(f, local_file, remote_dir, filename)
      })
      .then(function() {
         console.log('done ', filename);
         dfd.resolve();
      })
      .fail(function(err) { 
         console.log('fail ', filename, err);
         dfd.reject(err);
      })
      .finally(function() {
         console.log('close', filename);
         f.end();
         //return dfd;
      });

      return dfd.promise;
   },

   push_dir : function(local, remote, extension, keepextension) {

      var dfd = Q.defer();

      var f, list;
      var connectoptions = this.settings.connect;

      get_source_files(local)
      .then(function(files) {
         list = clean_file_list(files, extension);
         return connect(connectoptions);
      })
      .then(function(conn) {
         f = conn;
         return Q.all(list.map(function(file) {
            var r_file = keepextension ? file : removeExtension(file);
            return put(f, local + file, remote, r_file);
         }));
         
      })
      .then(function() {
         console.log('done', local);
         dfd.resolve(list.map(function(file) {return removeExtension(file);}));
      })
      .finally(function() {
         console.log('close',local);
         f.end();
      });

      return dfd.promise;
   }
};

module.exports = Mis_ftp;
