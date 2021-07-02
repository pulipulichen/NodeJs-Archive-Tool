const fs = require('fs')
const path = require('path')

const trash = require('./../fileRemove/trashFile.js')

async function moveFilesInSameNameFolder(file) {
  
  //console.log(file, fs.existsSync(file), fs.lstatSync(file).isDirectory())
  
  // 檢查這個filePath是不是資料夾
  if (fs.existsSync(file) === false
          || fs.lstatSync(file).isDirectory() === false) {
    return false
  }
  
  // 檢查該資料夾下面是否符合條件：1. 只有一個資料夾 2. 資料夾名稱跟它一樣
  let dirName = path.basename(file)
  
  let filesInDir = fs.readdirSync(file, { withFileTypes: true })
    .map(dirent => dirent.name)
  
  //console.log(filesInDir)
  
  if (filesInDir.length !== 1
          || filesInDir[0] !== dirName) {
    return false
  }
  
  filesInDir = filesInDir[0]
  
  if (fs.lstatSync(file + '/' + filesInDir).isDirectory() === false) {
    // 表示只有它一個檔案
    let oldName = file + '/' + filesInDir
    let newName = path.dirname(file) + '/' + filesInDir + '.tmp'
    
    while (fs.existsSync(newName)) {
      newName = newName + '.tmp'
    }
    fs.renameSync(oldName, newName)
    //fs.rmdirSync(file)
    await trash(file)
    
    fs.renameSync(newName, file)
    return true
  }
  
  let list = fs.readdirSync(file + '/' + filesInDir, { withFileTypes: true })
  for (let i = 0; i < list.length; i++) {
    let fileInSubDir = list[i]
    let fileInSubDirName = fileInSubDir.name

    let oldName = file + '/' + filesInDir + '/' + fileInSubDirName
    let newName = file + '/' + fileInSubDirName

    if (fs.existsSync(newName) === false) {
      fs.renameSync(oldName, newName)
    }
    else {
      let newNameTemp = newName

      while (fs.existsSync(newNameTemp)) {
        newNameTemp = newNameTemp + '.tmp'
      }

      fs.renameSync(oldName, newNameTemp)

      //fs.rmdirSync(newName)
      await trash(newName)
      fs.renameSync(newNameTemp, newName)
    }
  }
  
  //console.log(file + '/' + filesInDir)
  if (fs.existsSync(file + '/' + filesInDir)
          && fs.readdirSync(file + '/' + filesInDir, { withFileTypes: true }).length === 0) {
    try {
      //fs.rmdirSync(file + '/' + filesInDir)
      await trash(file + '/' + filesInDir)
    }
    catch (e) {}
  }
  
  moveFilesInSameNameFolder(file)
}

module.exports = moveFilesInSameNameFolder