/* global __dirname */

const path = require('path')
const fs = require('fs')
const execShellCommand = require('./../cli/execShellCommand.js')

let tikaJAR = path.resolve(__dirname, '../../vendors/ApacheTika/tika-app-2.0.0-BETA.jar')
//let tikaConfig = path.resolve(__dirname, '../../vendors/ApacheTika/tika-config.xml')

const config = require('./../../config.js')

let extractFulltext = async function (filepath, mime) {
  let type = getFulltextType(filepath, mime)
  if (type === false) {
    return null
  }
  
  let output
  if (type === 'tika') {
    output = extractByTika(filepath)
  }
  else {
    output = extractByPlainText(filepath)
  }
  
  output = cleanText(output)
  //console.log('----------------')
  //console.log(output)
  //console.log('----------------')
  
  //return ''
  
  return output
}

let cleanText = function (output) {
  
  output = output.replace(/\n/g, ' ')
  output = output.replace(/\t/g, ' ')
  while (output.indexOf('  ') > -1) {
    output = output.replace(/  /g, ' ')
  }
  output = output.trim()
  
  return output
}

let getFulltextType = function (filepath, mime) {
  if (mime === false) {
    mime = path.extname(filepath)
  }
  
  if (config.fulltext.plainTextMIME.indexOf(mime) > -1) {
    return 'plainText'
  }
  else if (config.fulltext.tikaMIME.indexOf(mime) > -1) {
    return 'tika'
  }
  return false
}

let extractByTika = async function (filepath) {
  
  let command = `java -Dfile.encoding=UTF8  -jar "${tikaJAR}" --text "${filepath}"`
  //console.log(command)
  
  //await execShellCommand(`export TIKA_CONFIG=${tikaConfig}`)
  let output = await execShellCommand(command)
  
  if (output.indexOf('\n\n') > -1) {
    output = output.slice(output.indexOf('\n\n') + 2)
  }
  
  return output
}

let extractByPlainText = function (filepath) {
  return fs.readFileSync(filepath)
} 

module.exports = extractFulltext