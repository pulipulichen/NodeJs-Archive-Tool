/* global process */

const execShellCommand = require('./execShellCommand.js')
const path = require('path')
const fs = require('fs')

let runFileArchiveCommand = async function (archiveFormat, file) {
  
  let filename = path.basename(file)
  let fileDir = path.dirname(file)
  
  process.chdir(fileDir)
  let command
  
  if (archiveFormat === 'zip') {
    command = `7z a -tzip -mcu=on -mx=9 "${filename}.zip" "${filename}"`
  }
  else if (archiveFormat === '7z') {
    command = `7z a -tzip -mx=9 "${filename}.7z" "${filename}"`
  }
  //console.log(fileDir)
  //console.log(command)
  await execShellCommand(command)
  
}

let runDirArchiveCommand = async function (archiveFormat, file) {
  
  let filename = path.basename(file)
  let fileDir = file
  
  process.chdir(fileDir)
  let command
  
  if (archiveFormat === 'zip') {
    command = `7z a -tzip -mcu=on -mx=9 "../${filename}.zip" *`
  }
  else if (archiveFormat === '7z') {
    command = `7z a -tzip -mx=9 "../${filename}.7z" *`
  }
  //console.log(fileDir)
  //console.log(command)
  await execShellCommand(command)
}

let checkArchiveExist = function (archiveFormat, file) {
  // 檢查檔案是否已經存在
  let filename = path.basename(file)
  let fileDir = path.dirname(file)
  
  if (fs.existsSync(file + '.' + archiveFormat)) {
    return true
  }
  return false
}

module.exports = async function (archiveFormat, file) {
  if (checkArchiveExist(archiveFormat, file)) {
    return false
  }
  
  // --------------------
  
  let currentWordDirectory = process.cwd()
  
  if (fs.lstatSync(file).isDirectory()) {
    await runDirArchiveCommand(archiveFormat, file)
  }
  else {
    await runFileArchiveCommand(archiveFormat, file)
  }
  process.chdir(currentWordDirectory) 
  
}

