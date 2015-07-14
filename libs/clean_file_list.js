module.exports = function clean_file_list(list, extension) {
      if (!extension) { 
         return list;
      }

      return list.filter(function(file) {
         var re = new RegExp('.' + extension + '$');
         return re.test(file);
      });
   };
