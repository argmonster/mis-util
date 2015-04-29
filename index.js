var _ = require('lodash');
var Deploy = require('./Deploy/Deploy.js');
var Parm = require('./Parm/Parm.js');

var defaults = {
   connect: {
      //host: 'hostname',
      //user: 'user',
      //password: 'pass'
   }
};

module.exports = function mis(options) {
   var settings = _.merge(defaults, options);
   return {
      deploy: Deploy(settings),
      parm: Parm()
   };
};
