const fs = require('fs')
const path = require('path')
const dayjs = require('dayjs')

const getDirectories = require('./../fileList/getDirectories.js')

const moveToTempDir = async function (dir) {
  let tempDir = dir + '-temp'
  
  let i = 0
  while (fs.existsSync(tempDir)) {
    i++
    tempDir = tempDir + i
  }
  
  let dirList = await getDirectories(dir)
  let dirToTemp = []
  
  let time = fs.lstatSync(dir).mtime
  
  dirList.forEach(dirPath => {
    let dirName = path.basename(dirPath)
    
    //console.log(dirPath, 1, dirPath.length)
    if (dirName.length < 10) {
      return false
    }
    
    //console.log(dirPath, 2)
    let prefixName = dirName.slice(0, 9)
    if (prefixName.endsWith(' ') === false) {
      return false
    }
    
    //console.log(dirPath, 3)
    let dateString = prefixName.slice(0, 8)
    
    if (/^\d{8}/.test(dateString) === false) {
      return false
    }
    
    //console.log(dateString)
    
    let tmpTime = dayjs(dateString).toDate()
    //console.log(dayjs(time).diff(tmpTime, 'year'))
    if (dayjs(time).diff(tmpTime, 'year') < 30) {
      dirToTemp.push(dirPath)
    }
  })
  
  if (dirToTemp.length > 0) {
    if (fs.existsSync(tempDir) === false) {
      fs.mkdirSync(tempDir)
    }
  }
  
  dirToTemp.forEach(dirPath => {
    let fromPath = dirPath
    let toPath = path.resolve(tempDir, path.basename(fromPath))
    //console.log(fromPath, toPath)
    fs.renameSync(fromPath, toPath)
  })
}

module.exports = moveToTempDir