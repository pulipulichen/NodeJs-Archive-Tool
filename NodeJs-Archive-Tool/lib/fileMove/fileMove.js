const fs = require('fs')
const sleep = require('./../await/sleep.js')
const removeFile = require('./../fileRemove/removeFile.js')

const fileMove = async function (fromPath, toPath) {
  if (fromPath === toPath) {
    console.error('[ERRRO] Same path', fromPath)
    return false
  }
  if (fs.existsSync(toPath)) {
    console.error('[ERRRO] toPath is existed', toPath)
    return false
  }
  
  while (true) {
    try {
      fs.renameSync(fromPath, toPath)
      break
    }
    catch (e) {
      console.error(e)
      await sleep(1000)
      console.log('[RETRY] fileMove: ', fromPath, toPath)
    }
  }
  
  while (fs.existsSync(fromPath)) {
    await removeFile(fromPath)
    await sleep(1000)
  }
}

module.exports = fileMove