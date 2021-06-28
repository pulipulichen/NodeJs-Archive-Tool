/* global __dirname */

const path = require('path')
const execShellCommand = require('./../cli/execShellCommand.js')

let tikaJAR = path.resolve(__dirname, '../../vendors/ApacheTika/tika-app-2.0.0-BETA.jar')
//let tikaConfig = path.resolve(__dirname, '../../vendors/ApacheTika/tika-config.xml')

module.exports = async function (filepath) {
  let command = `java -Dfile.encoding=UTF8  -jar "${tikaJAR}" --text "${filepath}"`
  //console.log(command)
  
  //await execShellCommand(`export TIKA_CONFIG=${tikaConfig}`)
  let output = await execShellCommand(command)
  
  if (output.indexOf('\n\n') > -1) {
    output = output.slice(output.indexOf('\n\n') + 2)
  }
  
  output = output.replace(/\n/g, ' ')
  while (output.indexOf('  ') > -1) {
    output = output.replace(/  /g, ' ')
  }
  output = output.trim()
  
  //console.log('----------------')
  //console.log(output)
  //console.log('----------------')
  
  //return ''
  
  return output
}