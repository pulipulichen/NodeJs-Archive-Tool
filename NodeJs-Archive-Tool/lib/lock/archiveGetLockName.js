/* global __dirname */

const fs = require('fs')

module.exports = function (archiveFormat, command) {
  return __dirname + '/' + archiveFormat + '.lock.txt'
}
