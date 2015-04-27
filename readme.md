## A Utility for CMHC/MIS systems

### Example

```
var util = require('mis-util');

var mis = util({sysname: '~/test', 
   connect: { 
      host: 'hostname', 
      user: 'username',
      password: 'pass'
   }
});

mis.parm.fromjsonfile('./pjson.parm')
.then(function(parm) { 
   return mis.parm.tofile('./out/parm/output.parm', parm);
})
.then(function() {
   return mis.parm.fromjsondir('./parm/');
})
.then(function(list) {
   return mis.parm.todir('./out/parm/', list);
})
.then(function() {
   return mis.deploy.parm();
});
mis.deploy.usc()
```

### Options and default settings

name|default value
-----|------------
sysname|/c1/FRSH
usc_path.local|./usc|
usc_path.remote|/SCRIPT/S
view_path.local|./views
view_path.remote|/CUST/forms
parm_path.local|./parm
parm_path.remote|/PARM
usc_extension|usc
view_extension|"uhp|html|htm"
parm_extension|parm
