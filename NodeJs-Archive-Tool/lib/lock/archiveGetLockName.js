/* global __dirname */

const fs = require('fs')
const os = require('os')

module.exports = function (archiveFormat, command) {
  return os.tmpdir() + '/' + archiveFormat + '.lock.txt'
}
