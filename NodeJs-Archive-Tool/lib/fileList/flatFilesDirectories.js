const getFileFromFolderRecursive = require('./getFileFromFolderRecursive.js')
const getDirectories = require('./getDirectories.js')
const trashFile = require('./../fileRemove/trashFile.js')

const path = require('path')
const fs = require('fs')

const flatFilesDirectories = async function (dir) {
  //console.log(dir)
  let fileList = await getFileFromFolderRecursive(dir)
  
  // 建立對應的檔案名稱
  let flatedFileList = fileList.map(filePath => {
    let relativeFilePath = filePath.slice(dir.length)
    let filename = relativeFilePath
    let extname = path.extname(filename)
    let filenameParts = filename
    if (extname && extname.length > 0) {
      filenameParts = filenameParts.slice(0, -1 * extname.length)
    }
    filenameParts = filenameParts.split('/').join(' ')
    filenameParts = filenameParts.split('_').join(' ')
    filenameParts = filenameParts.split('-').join(' ')
    filenameParts = filenameParts.split('.').join(' ')
    filenameParts = filenameParts.split('+').join(' ')
    filenameParts = filenameParts.split('=').join(' ')
    filenameParts = filenameParts.split(' ')
    
    var result = [];
    filenameParts.forEach(function(item) {
      
         if (item.trim() !== '' 
                 && result.indexOf(item) === -1) {
             result.push(item)
         }
    });
    
    let flatedPath = result.join(' ').trim()
    if (extname && extname !== '') {
      flatedPath = flatedPath + extname
    }
    //console.log(filename)
    return path.resolve(dir, flatedPath)
  })
  
  //console.log(flatedFileList)
  
  fileList.forEach((fromPath, i) => {
    let toPath = flatedFileList[i]
    //console.log(fromPath, toPath)
    fs.renameSync(fromPath, toPath)
  })
  
  // ---------------------------------
  
  let dirList = getDirectories(dir)
  for (let i = 0; i < dirList.length; i++) {
    await trashFile(dirList[i])
  }
}

module.exports = flatFilesDirectories