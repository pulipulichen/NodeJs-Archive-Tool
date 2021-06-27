const fs = require('fs')
const deleteFolderRecursive = require('./deleteFolderRecursive.js')

module.exports = function (file) {
  if (fs.existsSync(file) === false) {
    return false
  }
  
  if (fs.lstatSync(file).isDirectory()) {
    deleteFolderRecursive(file)
  }
  else {
    fs.unlinkSync(file)
  }
  return true
}