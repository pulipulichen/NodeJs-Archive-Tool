/* global process */

module.exports = function () {
  let output = []
  process.argv.forEach(function (val, index, array) {
    if (index < 2) {
      return false
    }
    //console.log(index + ': ' + val);
    output.push(val)
  })
  
  return output
}