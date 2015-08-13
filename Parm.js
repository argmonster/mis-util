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

var parse_dstlist = function parse_dstlist(data) {
   return data.replace(/\s*[\r\n]$/,'')
      .split(/\n\r?/m).map(function(r) { 
      var cols = r.replace(/\s*[\n\r]/,'').split('|');
      return {
         system: cols[0],
         number: parseInt(cols[1], 10),
         shortname: cols[2].replace(/\s*$/, ''),
         description: cols[3].replace(/\s*$/, ''),
         sensitivity: cols[4],
         database: parseInt(cols[5], 10),
         type: cols[6],
         edit: parseInt(cols[7], 10),
         length: parseInt(cols[8], 10),
         dct: parseInt(cols[9], 10),
         record: parseInt(cols[10], 10),
         picture: cols[11],
         recode: cols[12],
         alternate: cols[13]
      };
   });
}

var Parm = function Parm(options) {
   settings = _.merge(defaults, options);

   return {
      dstlisttojson: function dstlisttojson(path) { 
         return readfile(path, 'utf-8')
         .then(parse_dstlist)
      },
      dstjsontoparm: function dstjsontoparm(options, data) { 
         return Q([].concat.apply([], data.map(function(dst, idx) {
            idx += 1 //make the array indexed from 1 not 0
            return options.map(function(opt) {
               //var val = (dst[opt.dstfield] || '').replace(opt.from, opt.to);
               var val = dst[opt.dstfield];
               if (val) { 
                  val = opt.parmname + '-' + idx + ' ' + val;
               } else {
                  val = null;
               }
               return val;
               //return opt.parmname + '-' + idx + ' ' + dst[opt.dstfield].replace(opt.from, opt.to);
            }).filter(function(item) { return item !== null; });

         })));
      },
      fromflatfile: function fromfile(path) {
         var self = this;
         return readfile(path, 'utf-8').then(function(data) { 
            return Q(data.split(/\n\r?/m).map(function(line) {
               return line;
               //if (line.substr(0,1) === '*') {
               //   return add_line(line);
               //}
               //var l = line.split(' ');
               //return add_line(l.shift(), l.join(' '));
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
         return writefile(path, data.map(function(line) {
               if (line.substr(0,1) === '*') {
                  return add_line(line);
               }
               var l = line.split(' ');
               return add_line(l.shift(), l.join(' '));
         }).join(''))
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
