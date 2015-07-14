var fs = require('fs');
var Q = require('q');
var _ = require('lodash');

var add_line = require('./libs/add_line.js');
var process_parm_values = require('./libs/process_parm_values.js');
var json_obj_to_arr = require('./libs/json_obj_to_arr.js');

var readfile = Q.nfbind(fs.readFile);
var writefile = Q.nfbind(fs.writeFile);
var readdir = Q.nfbind(fs.readdir);

var defaults = {
   parm_extension: '.parm'
};

var settings = {};

var mapjson = function mapjson(json) {
   return Array.prototype.concat.apply([], json_obj_to_arr(json).map(function(value) {
      return process_parm_values(value.key, value.val);
   }));
};

var Parm = function Parm(options) {
   settings = _.merge(defaults, options);

   return {
      fromflatfile: function fromfile(path) {
         var self = this;
         return readfile(path, 'utf-8').then(function(data) { 
            return Q(data.split(/\n\r?/m).map(function(line) {
               if (line.substr(0,1) === '*') {
                  return add_line(line);
               }
               var l = line.split(' ');
               return add_line(l.shift(), l.join(' '));
            }));
         });
      },
      fromjsonfile: function fromjsonfile(path) {
         return readfile(path, 'utf-8')
         .then(function(data) {
            try {
               return Q(mapjson(JSON.parse(data)));
            } catch(e) {
               return Q.reject(e);
            }
         });
      },
      tofile: function tofile(path, data) {
         return writefile(path, data.join(''))
         .then(function() {
            console.log('Parm written to: ', path);
         })
         .fail(function(err) {
            console.log('Parm file write error:', err);
         });
      },
      fromjsondir: function fromjsondir(dir) {
         var self = this;
         return readdir(dir)
         .then(function(list) {
            return Q.all(list.map(function(name) {
               return self.fromjsonfile(dir + name)
               .then(function(data) {
                  return {
                     name: name.substr(0, name.lastIndexOf('.')),
                     data: data //self.fromjsonfile(dir + name)
                  };
               });
            }));
         })
      },
      todir: function todir(dir, list) {
         var self = this;
         console.log('todir');
         return Q(list.map(function(file) {
            console.log(dir, file);
            return self.tofile(dir + file.name + settings.parm_extension, 
               file.data);
         }));
      }
   };

};

module.exports = Parm;
