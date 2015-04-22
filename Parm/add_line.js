module.exports = function add_line(name, value) {
   name = name.replace(/[\r\n]/g, '');
   value = (value || '').replace(/[\r\n]/g, '');
   var head = name ? name.toUpperCase() + ' ' + value : '';
   var tail = Array(80 - head.length).join(' ');
   return head + tail;
};
