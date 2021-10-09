const fs = require('fs')
const path = require('path')

const getDirectories = require('./getDirectories.js')

const moveDirToYYYYMMDir = async function (dir) {
  let dirList = await getDirectories(dir)
  
  for (let i = 0; i < dirList.length; i++) {
    let dirpath = dirList[i]
    let dirname = path.basename(dirpath)
    
    if (/^\d{8}/.test(dirname.slice(0,9)) === false) {
      continue
    }
    
    let yyyy = dirname.slice(0, 4)
    let mm = dirname.slice(4, 6)
    
    if (fs.existsSync(path.resolve(dir, yyyy)) === false) {
      fs.mkdirSync(path.resolve(dir, yyyy))
    }
    
    if (fs.existsSync(path.resolve(dir, yyyy, mm)) === false) {
      fs.mkdirSync(path.resolve(dir, yyyy, mm))
    }
    
    fs.renameSync(dirpath, path.resolve(dir, yyyy, mm, dirname))
  }
}

module.exports = moveDirToYYYYMMDir