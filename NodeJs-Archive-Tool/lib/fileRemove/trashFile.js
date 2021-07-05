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
      await trash(file, {
        glob: false
      })
      break
    } catch (e) {
      await sleep(3000)
      i++
    }
  }
}