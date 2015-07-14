var _ = require('lodash');
var Deploy = require('./Deploy.js');
var Parm = require('./Parm.js');
var Script = require('./Script.js');

var defaults = {
   connect: {
      //host: 'hostname',
      //user: 'user',
      //password: 'pass'
   },
   sysname: '/c1/FRSH',
   webname: '/c0/cmhcweb/cmhcbui/cmhcbuilocal/',
   usc_path: {local: './usc/', remote: '/SCRIPT/S'},
   view_path: {local: './views/', remote: '/CUST/forms'},
   parm_path: {local: './parm/', remote: '/PARM'},
   js_path: {local: './js/', remote: '/js'},
   css_path: {local: './css/', remote: '/css'},
   img_path: {local: './img/', remote: '/img'},
};

module.exports = function mis(options) {
   var settings = _.merge(defaults, options);
   return {
      settings: settings,
      deploy: Deploy(settings),
      parm: Parm(),
      script: Script(settings)
   };
};
