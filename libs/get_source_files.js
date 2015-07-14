var fs = require('fs');
var Q = require('q');

module.exports = function get_source_files(path) {
   var dfd = Q.defer();
   fs.readdir(path, function(err, files) {
      dfd.resolve(files);
   });
   return dfd.promise;
};
