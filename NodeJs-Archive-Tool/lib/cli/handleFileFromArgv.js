/* global Promise */

let fs = require('fs')
let getArgv = require('./getArgv.js')

// --------------------------

const archiveIsLocked = require('./../lock/archiveIsLocked.js')
const archiveSetLock = require('./../lock/archiveSetLock.js')
const archiveUnsetLock = require('./../lock/archiveUnsetLock.js')
  
const sleep = require('./../await/sleep.js')

module.exports = async function (options = {}, callback) {
  
  let outputFile
  
  let output = getArgv()
  
  let {
    lockKey = 'main',
    validateDirectory = false,
    loadPackages
  } = options
  
  let isPacakgesLoaded = false
  
  //for (let len = output.length, i = len; i > 0; i--) {
  await Promise.all(output.map(async (file) => {
    //let file = output[(len - i)]
    
    try {
      if (fs.existsSync(file) === false) {
        //return continue
        return false
      }
      
      if (validateDirectory === true 
              && fs.lstatSync(file).isDirectory() === false) {
        throw Error(file + ' should be a directory.')
      }
      
      //console.log(typeof(loadPackages), isPacakgesLoaded)
      
      if (isPacakgesLoaded === false 
              && typeof(loadPackages) === 'function') {
        loadPackages()
        isPacakgesLoaded = true
      }
      
      // --------------------------

      while (archiveIsLocked(lockKey, file)) {
        //console.log('locked', lockKey, file)
        await sleep()
      }

      await archiveSetLock(lockKey, file)

      // --------------------------

      await callback(file)
      
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
  })) // for (let len = output.length, i = len; i > 0; i--) {

  return outputFile
}