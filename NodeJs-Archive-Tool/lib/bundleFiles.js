let fs = require('fs')
let getArgv = require('./cli/getArgv.js')

// --------------------------

let bundleFilesMain

const archiveIsLocked = require('./lock/archiveIsLocked.js')
const archiveSetLock = require('./lock/archiveSetLock.js')
const archiveUnsetLock = require('./lock/archiveUnsetLock.js')
  
const sleep = require('./await/sleep.js')


function loadPackages () {
  bundleFilesMain = require('./bundleFiles/bundleFilesMain.js')
}

// ---------------

module.exports = async function (options) {
  
  let outputFile
  
  let output = getArgv()
  
  let lockKey = 'build-list'
  
  for (let len = output.length, i = len; i > 0; i--) {
    let file = output[(len - i)]
    
    try {
      
      if (!bundleFilesMain) {
        loadPackages()
      }
      
      //console.log(file, fs.existsSync(file))

      if (fs.existsSync(file) === false) {
        continue
      }
      
      if (fs.lstatSync(file).isDirectory() === false) {
        throw Error(file + ' should be a directory.')
      }

      // --------------------------

      while (archiveIsLocked(lockKey)) {
        await sleep()
      }

      await archiveSetLock(lockKey, file)

      // --------------------------

      await bundleFilesMain(options, file)
      
      // ---------------------------

      archiveUnsetLock(lockKey)
    }
    catch (e) {
      var today = new Date();
      var time = today.getHours() + '' + today.getMinutes()
      fs.writeFileSync(file + '-' + lockKey + '-' + time + '.error.txt', e.stack)
      archiveUnsetLock(lockKey)
      
      throw e
    } 
    
    
    // --------------------------
  } // for (let len = output.length, i = len; i > 0; i--) {

  return outputFile
}