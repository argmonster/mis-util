module.exports = function json_obj_to_arr(json) {
   if (json instanceof Array) {
      return json;
   }
   var out = [];
   for (var key in json) {
      out.push({key: key, val: json[key]});
   }
   return out;
};


