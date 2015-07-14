var add_line = require('./add_line.js');

module.exports = function process_parm_values(key, val) {
   if (val instanceof Array) {
      return Array.prototype.concat.apply([], val.map(function(v, i) {
         if (v instanceof Array) {
            return v.map(function(curr, j) {
               return add_line(key + '-' + (i + 1) + '-' + (j + 1), curr);
            });
         }
         return [add_line(key +'-' + (i + 1), v)];
      }));
   } else if (!(val instanceof Object)) {
      return [add_line(key, val)];
   } else {
      console.log('Unsupported value for key: ', key);
      return [];
   }
};

