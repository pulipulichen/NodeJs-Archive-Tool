const handleFileFromArgv = require('./cli/handleFileFromArgv.js')
const fs = require('fs')

// --------------------------

let bundleFilesMain

function loadPackages () {
  bundleFilesMain = require('./bundleFiles/bundleFilesMain.js')
}

// ---------------


module.exports = async function (options) {
  await handleFileFromArgv({
    lockKey: 'build-list'
  }, async (file) => {
    if (!bundleFilesMain) {
      loadPackages()
    }
    
    if (fs.lstatSync(file).isDirectory() === false) {
      throw Error(file + ' should be a directory.')
    }
    
    await bundleFilesMain(options, file)
    
  })
}