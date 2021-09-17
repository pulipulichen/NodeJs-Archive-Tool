/* global __dirname */

const trash = require('trash')
const sleep = require('./../await/sleep.js')

const os = require('os')
const path = require('path')
const execShellCommand = require('./../cli/execShellCommand.js')

module.exports = async function (file) {
  let i = 0
  while (i < 3) {
    try {
      let platform = await os.platform()
      //console.log()
      
      try {
        await trash(file, {
          glob: false
        })
      }
      catch (e) {
        await execShellCommand('trash ' + file)
      }
      break
    } catch (e) {
      console.error(e, file)
      await sleep(3000)
      i++
    }
  }
}