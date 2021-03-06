/* global process, __dirname */

const execShellCommand = require('./../cli/execShellCommand.js')
const path = require('path')
const fs = require('fs')

const archiveIsLocked = require('./../lock/archiveIsLocked.js')
const archiveSetLock = require('./../lock/archiveSetLock.js')
const archiveUnsetLock = require('./../lock/archiveUnsetLock.js')

const moveFilesInSameNameFolder = require('./moveFilesInSameNameFolder.js')

const sleep = require('./../await/sleep.js')
const get7zPath = require('./get7zPath.js')

module.exports = async function (file) {
  let archiveFormat = 'extract'
  while (archiveIsLocked(archiveFormat, file)) {
    await sleep()
  }
  
  let currentWordDirectory = __dirname
  try {
    currentWordDirectory = process.cwd()
  } catch (e) {}
  let fileDir = path.dirname(file)
  
  process.chdir(fileDir) 
  
  let targetDirName = path.parse(file).name
  let command 
  
  //throw Error(targetDirName + ';' + path.basename(path.dirname(file)))
  if (targetDirName !== path.basename(path.dirname(file))) {
    command = `${get7zPath()} x -mmt=off "${file}" -o"${targetDirName}/"`
  }
  else {
    command = `${get7zPath()} x -mmt=off "${file}"`
  }
  //console.log(command)
  await archiveSetLock(archiveFormat, command)
  
  await execShellCommand(command)
  
  archiveUnsetLock(archiveFormat)
  
  process.chdir(currentWordDirectory) 
  
  let targetPath = fileDir + '/' + targetDirName
  
  moveFilesInSameNameFolder(targetPath)
  
  return targetPath
}

