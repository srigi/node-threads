export default (n) => {
  var ret = 1;

  for (var i = 2; i <= n; i += 1) {
    ret *= i;
  }

  return ret;
};
