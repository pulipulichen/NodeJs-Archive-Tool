/* global __dirname */

const os = require('os');
const path = require('path')

module.exports = function () {
  //console.log(os.platform())
  if (os.platform() === 'win32') {
    return '"' + path.resolve(__dirname, '../../vendors/7zip/7z.exe') + '"'
  }
  return '7z'
}