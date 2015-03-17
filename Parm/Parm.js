var fs = require('fs');
var Q = require('q');

var add_line = require('./add_line.js');
var process_parm_values = require('./process_parm_values.js');
var json_obj_to_arr = require('./json_obj_to_arr.js');

var readfile = Q.nfbind(fs.readFile);

var Parm = function Parm(options) {
   this.settings = options;
   this.parm = [];
};

Parm.prototype = {
   addline: function addline(name, value) {
      this.parm.push(add_line(name, value));
      return this;
   },
   fromfile: function fromfile(path) {
      var self = this;
      var dfd = Q.defer();
      readfile(path, 'utf-8').then(function(data) { 
         self.parm = data.split(/\n\r?/m).map(function(line) {
            if (line.substr(0,1) === '*') {
               return add_line(line);
            }
            var l = line.split(' ');
            return add_line(l.shift(), l.join(' '));
         });
         dfd.resolve(self);
      });
      return dfd.promise;
   },
   fromjson: function fromjson(json) {

      this.parm = this.parm.concat.apply(
         this.parm, 
         json_obj_to_arr(json).map(function(value) {
               return process_parm_values(value.key, value.val);
         })
      );
      return this;
   },
   tofile: function tofile(path) {
      return "Not Implemented Yet";
   },
   tojson: function tojson() {
      if (!this.parm) {
         return [];
      }
      console.log(this.parm);
      return this.parm .map(function(line) {
         line = line.replace(/ *$/, '');
         if (line.substr(0,1) === '*') {
            return {key: line, value: ''};
         }
         var l = line.split(' ');
         var key = l.shift();
         if (key.indexOf('-') > -1) {
            var a = key.split('-');
            return {key: a[0], x: a[1], y: a[2], value: l.join(' ')}
         }
         return {key: key, value: l.join(' ')};
      });
   }
};

module.exports = Parm;
