const fs = require('fs')
const archiveGetLockName = require('./archiveGetLockName.js')

module.exports = function (archiveFormat, file) {
  let isLocked = fs.existsSync(archiveGetLockName(archiveFormat))
  
  let lockIndicator = file + '.wait.txt'
  
  if (isLocked) {
    if (fs.existsSync(lockIndicator) === false) {
      fs.writeFileSync(lockIndicator, '')
    }
  }
  
  if (fs.existsSync(lockIndicator)) {
    fs.unlinkSync(lockIndicator)
  }
  
  return isLocked
}
