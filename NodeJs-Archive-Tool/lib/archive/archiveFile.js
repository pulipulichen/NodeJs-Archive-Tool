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

let runFileArchiveCommand = async function (archiveFormat, file) {
//  while (archiveIsLocked(archiveFormat, file)) {
//    await sleep()
//  }
  
  let filename = path.basename(file)
  let fileDir = path.dirname(file)
  
  process.chdir(fileDir)
  let command
  
  let outputFile = file
  if (archiveFormat === 'zip') {
    outputFile = outputFile + '.zip'
    command = `${get7zPath()} a -tzip -mmt=off -mcu=on -mx=9 "${filename}.zip" "${filename}"`
  }
  else if (archiveFormat === '7z') {
    outputFile = outputFile + '.7z'
    command = `${get7zPath()} a -t7z -mmt=off -mx=9 "${filename}.7z" "${filename}"`
  }
  //console.log(fileDir)
  
  //await archiveSetLock(archiveFormat, command)
  
  await execShellCommand(command)
  
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
  
  let outputFile = file
  if (archiveFormat === 'zip') {
    outputFile = outputFile + '.zip'
    command = `${get7zPath()} a -tzip -mmt=off -mcu=on -mx=9 "../${filename}.zip" *`
  }
  else if (archiveFormat === '7z') {
    outputFile = outputFile + '.7z'
    command = `${get7zPath()} a -t7z -mmt=off -mx=9 "../${filename}.7z" *`
  }
  //console.log(fileDir)
  //console.log(command)
  
  //await archiveSetLock(archiveFormat, command)
  
  await execShellCommand(command)
  
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
  //await sleep(300 * 1000)
  
  let currentWordDirectory = __dirname
  try {
    currentWordDirectory = process.cwd()
  } catch (e) {}
  
  let outputPath
  if (fs.lstatSync(file).isDirectory()) {
    // 檢查裡面是否有檔案
    if (isEmptyFolder(file)) {
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

