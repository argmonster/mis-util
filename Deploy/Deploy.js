var _ = require('lodash');

var Ftp = require('./Ftp.js');

var defaults = {
   sysname: '/c1/FRSH',
   usc_path: {local: './usc/', remote: '/SCRIPT/S'},
   view_path: {local: './views/', remote: '/CUST/forms'},
   parm_path: {local: './parm/', remote: '/PARM'},
   usc_extension: 'usc',
   view_extension: 'uhp|html|htm',
   parm_extension: 'parm',
   connect: {
      host: 'gccmhc',
      user: 'tim'
   }
};

module.exports = function(options) {

   var settings = _.merge(defaults, options);

   var ftp = new Ftp(settings);

   return {
      usc: ftp.push_dir.bind(
         ftp, 
         settings.usc_path.local, 
         settings.sysname + settings.usc_path.remote, 
         settings.usc_extension
      ),
      views: ftp.push_dir.bind(
         ftp, 
         settings.view_path.local, 
         settings.sysname + settings.view_path.remote, 
         settings.view_extension
      ),
      parm: ftp.push_dir.bind(
         ftp, 
         settings.parm_path.local, 
         settings.sysname + settings.parm_path.remote, 
         settings.parm_extension
      )
   };
};
