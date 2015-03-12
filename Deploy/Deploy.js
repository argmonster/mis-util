var _ = require('lodash');

var Ftp = require('./Ftp.js');

var defaults = {
   sysname: '/c1/FRSH',
   usc_path: {local: './usc/', remote: '/SCRIPT/S/'},
   view_path: {local: './views/', remote: '/CUST/forms/'},
   parm_path: {local: './parm/', remote: '/PARM/'},
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
      push_usc: ftp.push_dir.bind(
         ftp, 
         settings.usc_path.local, 
         settings.usc_path.remote, 
         settings.usc_extension
      ),
      push_views: ftp.push_dir.bind(
         ftp, 
         settings.view_path.local, 
         settings.view_path.remote, 
         settings.view_extension
      ),
      push_parm: ftp.push_dir.bind(
         ftp, 
         settings.parm_path.local, 
         settings.parm_path.remote, 
         settings.parm_extension
      )
   };
};
