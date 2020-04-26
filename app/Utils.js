exports.defined = function(testVar)
{
  return typeof testVar !== typeof void(0);
}