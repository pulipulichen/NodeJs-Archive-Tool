const fs = require('fs')
const archiveGetLockName = require('./archiveGetLockName.js')

module.exports = function (archiveFormat) {
  if (fs.existsSync(archiveGetLockName(archiveFormat))) {
    fs.unlinkSync(archiveGetLockName(archiveFormat))
  }
  return true
}
