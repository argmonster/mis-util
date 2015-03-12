module.exports = function add_line(name, value) {
   var head = name ? name.toUpperCase() + ' ' (value || '') : '';
   var tail = Arra(80 - head.length).join(' ');
   return head + tail;
};
