const fs = require('fs')
const path = require('path')

function moveFilesInSameNameFolder(file) {
  
  //console.log(fs.existsSync(file), fs.lstatSync(file).isDirectory())
  
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
  
  fs.readdirSync(file + '/' + filesInDir, { withFileTypes: true })
    .map(fileInSubDir => {
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

        fs.rmdirSync(newName)
        fs.renameSync(newNameTemp, newName)
      }
    })
  
  //console.log(file + '/' + filesInDir)
  if (fs.existsSync(file + '/' + filesInDir)
          && fs.readdirSync(file + '/' + filesInDir, { withFileTypes: true }).length === 0) {
    try {
      fs.rmdirSync(file + '/' + filesInDir)
    }
    catch (e) {}
  }
  
  moveFilesInSameNameFolder(file)
}

module.exports = moveFilesInSameNameFolder