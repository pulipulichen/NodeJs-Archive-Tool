/* global process, __dirname */

const execShellCommand = require('./../cli/execShellCommand.js')
const path = require('path')
const fs = require('fs')

const archiveIsLocked = require('./../lock/archiveIsLocked.js')
const archiveSetLock = require('./../lock/archiveSetLock.js')
const archiveUnsetLock = require('./../lock/archiveUnsetLock.js')
const moveFilesInSameNameFolder = require('./moveFilesInSameNameFolder.js')

const get7zPath = require('./get7zPath.js')
const sleep = require('./../await/sleep.js')

const isEmptyFolder = require('./../fileList/isEmptyFolder.js')

const os = require('os')

let runFileArchiveCommand = async function (archiveFormat, file) {
//  while (archiveIsLocked(archiveFormat, file)) {
//    await sleep()
//  }
  
  let filename = path.basename(file)
  let fileDir = path.dirname(file)
  
  process.chdir(fileDir)
  let command
  
  let tmpPath = os.tmpdir() + '/'
  let targetPath
  
  let outputFile = file
  if (archiveFormat === 'zip') {
    outputFile = outputFile + '.zip'
    targetPath = filename + '.zip'
    //tmpPath = tmpPath + outputFile
  }
  else if (archiveFormat === '7z') {
    outputFile = outputFile + '.7z'
    targetPath = filename + '.7z'
  }
  
  tmpPath = tmpPath + outputFile
  if (os.platform() === 'win32') {
    tmpPath = path.dirname(outputFile) + '/' + filename + '.' + archiveFormat
  }
  command = `${get7zPath()} a -t7z -mmt=off -mx=9 "${tmpPath}" "${filename}"`
  
  //console.log(fileDir)
  
  //await archiveSetLock(archiveFormat, command)
  
  await execShellCommand(command)
  
  // 移動檔案
  if (os.platform() !== 'win32') {
    fs.renameSync(tmpPath, targetPath)
  }
  
  //archiveUnsetLock(archiveFormat)
  
  return outputFile
}

let runDirArchiveCommand = async function (archiveFormat, file) {
//  while (archiveIsLocked(archiveFormat, file)) {
//    await sleep()
//  }
  
  moveFilesInSameNameFolder(file)
  
  let filename = path.basename(file)
  let fileDir = file
  
  process.chdir(fileDir)
  let command
  
  
  let tmpPath = os.tmpdir() + '/'
  let targetPath
  
  let outputFile = file
  if (archiveFormat === 'zip') {
    outputFile = outputFile + '.zip'
    //command = `${get7zPath()} a -tzip -mmt=off -mcu=on -mx=9 "../${filename}.zip" *`
    
  }
  else if (archiveFormat === '7z') {
    outputFile = outputFile + '.7z'
    //command = `${get7zPath()} a -t7z -mmt=off -mx=9 "../${filename}.7z" *`
  }
  
  targetPath = path.resolve("../" + filename + '.' + archiveFormat)
  tmpPath = tmpPath + filename + '.' + archiveFormat
  if (os.platform() === 'win32') {
    tmpPath = targetPath
  }
  
  command = `${get7zPath()} a -t7z -mmt=off -mx=9 "${tmpPath}" *`
  //throw Error(command + '\n' + os.tmpdir())
  //console.log(fileDir)
  //console.log(command)
  
  //await archiveSetLock(archiveFormat, command)
  
  await execShellCommand(command)
  
  // 移動檔案
  if (os.platform() !== 'win32') {
    fs.renameSync(tmpPath, targetPath)
  }
  
  //archiveUnsetLock(archiveFormat)
  
  return outputFile
}

let checkArchiveExist = function (archiveFormat, file) {
  // 檢查檔案是否已經存在
//  let filename = path.basename(file)
//  let fileDir = path.dirname(file)
  
  if (fs.existsSync(file + '.' + archiveFormat)) {
    return true
  }
  return false
}

module.exports = async function (archiveFormat, file) {
  if (checkArchiveExist(archiveFormat, file)) {
    return file + '.' + archiveFormat
  }
  
  // --------------------
  
  //console.log('開始睡')
  //await sleep(30 * 1000)
  //throw Error('故意測試錯誤')
  
  let currentWordDirectory = __dirname
  try {
    currentWordDirectory = process.cwd()
  } catch (e) {}
  
  let outputPath
  if (fs.lstatSync(file).isDirectory()) {
    // 檢查裡面是否有檔案
    if (await isEmptyFolder(file)) {
      throw Error('folder is empty.')
    }
    
    //console.log('a')
    outputPath = await runDirArchiveCommand(archiveFormat, file)
  }
  else {
    //console.log('b')
    outputPath = await runFileArchiveCommand(archiveFormat, file)
  }
  process.chdir(currentWordDirectory) 
  
  return outputPath
}

