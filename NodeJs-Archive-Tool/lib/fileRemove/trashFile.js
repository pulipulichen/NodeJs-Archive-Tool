const trash = require('trash')
const sleep = require('./../await/sleep.js')

module.exports = async function (file) {
  let i = 0
  while (i < 3) {
    try {
      await trash(file)
      break
    } catch (e) {
      await sleep(3000)
      i++
    }
  }
}