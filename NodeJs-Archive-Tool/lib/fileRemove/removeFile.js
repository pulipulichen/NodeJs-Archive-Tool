const fs = require('fs')
const deleteFolderRecursive = require('./deleteFolderRecursive.js')

const trash = require('./trashFile.js')

module.exports = async function (file) {
  if (fs.existsSync(file) === false) {
    return false
  }
  
  /*
  if (fs.lstatSync(file).isDirectory()) {
    deleteFolderRecursive(file)
  }
  else {
    //fs.unlinkSync(file)
    await trash(file)
  }
  */
  await trash(file)
  return true
}