var Deploy = require('./Deploy/Deploy.js');
var Parm = require('./Parm/Parm.js');

module.exports = function mis(options) {
   return {
      deploy: Deploy(options),
      parm: Parm()
   };
};
