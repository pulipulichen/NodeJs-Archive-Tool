const handleFileFromArgv = require('./cli/handleFileFromArgv.js')
const fs = require('fs')

// --------------------------

let bundlePhotosMain

function loadPackages () {
  bundlePhotosMain = require('./bundlePhotos/bundlePhotosMain.js')
}

// ---------------

module.exports = async function (options) {
  await handleFileFromArgv({
    lockKey: 'bundle-photos'
  }, async (file) => {
    if (!bundlePhotosMain) {
      loadPackages()
    }
    
    if (fs.lstatSync(file).isDirectory() === false) {
      throw Error(file + ' should be a directory.')
    }
    
    await bundlePhotosMain(options, file)
    
  })
}