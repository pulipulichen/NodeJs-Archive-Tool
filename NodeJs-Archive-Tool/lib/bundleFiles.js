let fs = require('fs')
let getArgv = require('./cli/getArgv.js')

// --------------------------

let bundleFilesMain

let archiveIsLocked
let archiveSetLock
let archiveUnsetLock
let sleep


function loadPackages () {
  bundleFilesMain = require('./bundleFiles/bundleFilesMain.js')
  
  archiveIsLocked = require('./lock/archiveIsLocked.js')
  archiveSetLock = require('./lock/archiveSetLock.js')
  archiveUnsetLock = require('./lock/archiveUnsetLock.js')
  
  sleep = require('./await/sleep.js')
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
      
      throw e
    } 
    
    
    // --------------------------
  } // for (let len = output.length, i = len; i > 0; i--) {

  return outputFile
}