exports.getArgVal = function (arg) {
  var index = process.argv.indexOf('--' + arg);
  if (index >= 0) {
    return process.argv[index + 1];
  }
  return null;
};