var add_line = require('./add_line.js');
var process_parm_values = require('./process_parm_values.js');
var json_obj_to_arr = require('./json_obj_to_arr.js');

var Parm = function Mis_parm(options) {
   this.settings = options;
   this.parm = [];
};

Parm.prototype = {
   addline: function addline(name, value) {
      this.parm.push(add_lin(name, value));
      return this;
   },
   fromfile: function fromfile(path) {
   },
   fromjson: function fromjson(json) {
      this.parm = thisparm.concat.apply(
         null, 
         json_obj_to_arr(json).map(function(value) {
               return process_parm_values(value.key, value.val);
         })
      );
      return this;
   },
   tofile: function tofile(path) {
   },
   tojson: function tojson() {
   }
};
