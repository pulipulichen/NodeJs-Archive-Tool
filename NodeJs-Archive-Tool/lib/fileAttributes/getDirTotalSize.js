/* global __dirname */

// https://coderrocketfuel.com/article/get-the-total-size-of-all-files-in-a-directory-using-node-js

const fs = require("fs")
const path = require("path")

const getAllFiles = function(dirPath, arrayOfFiles) {
  if (fs.existsSync(dirPath) === false) {
    return []
  }
  if (fs.lstatSync(dirPath).isDirectory() === false) {
    return [dirPath]
  }
  
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(dirPath, file))
    }
  })

  return arrayOfFiles
}

const getTotalSize = function(directoryPath) {
  const arrayOfFiles = getAllFiles(directoryPath)

  //console.log(arrayOfFiles)
  let totalSize = 0

  arrayOfFiles.forEach(function(filePath) {
    //console.log(filePath)
    totalSize += fs.statSync(filePath).size
  })

  return totalSize
}

module.exports = getTotalSize