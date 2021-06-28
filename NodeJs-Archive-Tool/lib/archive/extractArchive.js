/* global process, __dirname */

const execShellCommand = require('./../cli/execShellCommand.js')
const path = require('path')
const fs = require('fs')

const archiveIsLocked = require('./lock/archiveIsLocked.js')
const archiveSetLock = require('./lock/archiveSetLock.js')
const archiveUnsetLock = require('./lock/archiveUnsetLock.js')

const sleep = require('./lock/sleep.js')

module.exports = async function (file) {
  let archiveFormat = 'extract'
  while (archiveIsLocked(archiveFormat)) {
    await sleep()
  }
  
  let currentWordDirectory = __dirname
  try {
    currentWordDirectory = process.cwd()
  } catch (e) {}
  
  let targetDirName = path.parse(file).name
  let fileDir = path.dirname(file)
  
  process.chdir(fileDir) 
  
  let command = `7z e "${file}" -o"${targetDirName}/"`
  //console.log(command)
  await archiveSetLock(archiveFormat, command)
  
  await execShellCommand(command)
  
  archiveUnsetLock(archiveFormat)
  
  process.chdir(currentWordDirectory) 
  
  return fileDir + '/' + targetDirName
}

