/* global process */

const execShellCommand = require('./execShellCommand.js')
const path = require('path')
const fs = require('fs')

module.exports = async function (file) {
  
  let currentWordDirectory = process.cwd()
  
  let targetDirName = path.parse(file).name
  let fileDir = path.dirname(file)
  
  process.chdir(fileDir) 
  
  let command = `7z e "${file}" -o"${targetDirName}/"`
  //console.log(command)
  await execShellCommand(command)
  
  process.chdir(currentWordDirectory) 
  
  return fileDir + '/' + targetDirName
}

