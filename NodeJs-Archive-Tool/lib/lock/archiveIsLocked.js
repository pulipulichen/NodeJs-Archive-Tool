const fs = require('fs')
const archiveGetLockName = require('./archiveGetLockName.js')

module.exports = function (archiveFormat, file) {
  let isLocked = fs.existsSync(archiveGetLockName(archiveFormat))
  
  let lockIndicator = file + '.wait.txt'
  
  //console.log(isLocked, lockIndicator, fs.existsSync(lockIndicator))
  if (isLocked) {
    if (fs.existsSync(lockIndicator) === false) {
      fs.writeFileSync(lockIndicator, '')
    }
  }
  else {
    if (fs.existsSync(lockIndicator)) {
      fs.unlinkSync(lockIndicator)
    }
  }
  return isLocked
}
