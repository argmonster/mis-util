module.exports = function process_parm_values(key, val) {
   if (val instanceof Array) {
      return val.map(function(v, i) {
         return add_line(key +'-' + i, v);
      });
   } else if (val !instanceof Object) {
      return [add_line(key, val)];
   } else {
      console.log('Unsupported value for key: ', key);
      return [];
   }
};

