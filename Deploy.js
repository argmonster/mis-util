var _ = require('lodash');

var Ftp = require('./libs/Ftp.js');

var defaults = {
   usc_extension: 'usc',
   view_extension: 'uhp|html|htm',
   parm_extension: 'parm',
   js_extension: 'js',
   css_extension: 'css',
   img_extension: 'jpg|png|gif',
   connect: {
      //host: 'hostname',
      //user: 'username'
   }
};

module.exports = function(options) {

   var settings = _.merge(defaults, options);

   var ftp = new Ftp(settings);

   return {
      file: ftp.push.bind(ftp),
      dir: ftp.push_dir.bind(ftp),
      usc: ftp.push_dir.bind(
         ftp, 
         settings.usc_path.local, 
         settings.sysname + settings.usc_path.remote, 
         settings.usc_extension
      ),
      view: ftp.push_dir.bind(
         ftp, 
         settings.view_path.local, 
         settings.sysname + settings.view_path.remote, 
         settings.view_extension,
         true
      ),
      parm: ftp.push_dir.bind(
         ftp, 
         settings.parm_path.local, 
         settings.sysname + settings.parm_path.remote, 
         settings.parm_extension
      ),
      js: ftp.push_dir.bind(
         ftp,
         settings.js_path.local,
         settings.webname + 
            settings.sysname.replace(/\//g, '') + 
            settings.js_path.remote,
         settings.js_extension,
         true
      ),
      css: ftp.push_dir.bind(
         ftp,
         settings.css_path.local,
         settings.webname + 
            settings.sysname.replace(/\//g, '') + 
            settings.css_path.remote,
         settings.css_extension,
         true
      ),
      img: ftp.push_dir.bind(
         ftp,
         settings.img_path.local,
         settings.webname + 
            settings.sysname.replace(/\//g, '') + 
            settings.img_path.remote,
         settings.img_extension,
         true
      )
   };
};
