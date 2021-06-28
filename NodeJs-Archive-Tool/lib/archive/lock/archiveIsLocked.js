const fs = require('fs')
const archiveGetLockName = require('./archiveGetLockName.js')

module.exports = function (archiveFormat) {
  return fs.existsSync(archiveGetLockName(archiveFormat))
}
