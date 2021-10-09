const fs = require('fs')
const path = require('path')
const dayjs = require('dayjs')

const getDirectories = require('./../fileList/getDirectories.js')

const moveBackTempDir = async function (dir) {
  let tempDir = dir + '-temp'
  
  if (!fs.existsSync(tempDir)) {
    return false
  }
  
  let dirList = await getDirectories(tempDir)
  
  dirList.forEach(dirPath => {
    let fromPath = dirPath
    let toPath = path.resolve(dir, path.basename(fromPath))
    
    fs.renameSync(fromPath, toPath)
  })
}

module.exports = moveBackTempDir