/* global __dirname */

const fs = require('fs')
const getArgv = require('./cli/getArgv.js')

let archiveFile
let removeFile
let extractArchive

let archiveIsLocked
let archiveSetLock
let archiveUnsetLock

let sleep

function loadPackages () {
  archiveFile = require('./archive/archiveFile.js')
  removeFile = require('./fileRemove/removeFile.js')
  extractArchive = require('./archive/extractArchive.js')
  
  archiveIsLocked = require('./lock/archiveIsLocked.js')
  archiveSetLock = require('./lock/archiveSetLock.js')
  archiveUnsetLock = require('./lock/archiveUnsetLock.js')
  
  sleep = require('./await/sleep.js')
}

module.exports = async function (archiveFormat) {
  
  let output = getArgv()
  //let file = output.join('')
  for (let len = output.length, i = len; i > 0; i--) {
    let file = output[(len - i)]
    
    //console.log(file, fs.existsSync(file))
    try {
      if (!archiveFile) {
        loadPackages()
      }

      if (fs.existsSync(file) === false) {
        continue
      }
      
      // --------------------
      while (archiveIsLocked(archiveFormat, file)) {
        await sleep()
      }
      
      await archiveSetLock(archiveFormat, file)
      
      // -----------------------

      if (file.endsWith('.zip') 
              || file.endsWith('.7z')
              || file.endsWith('.rar')) {
        // 表示是壓縮檔，需要解壓縮

        if ( (file.endsWith('.zip') && archiveFormat === '7z')
                || (file.endsWith('.7z') && archiveFormat === 'zip')) {
          // 表示需要轉換爲7z
          let fileDir = await extractArchive(file)
          await removeFile(file)

          await archiveFile(archiveFormat, fileDir)
          await removeFile(fileDir)
        }
        else {
          // 表示解壓縮之後，刪除該檔案
          await extractArchive(file)
          await removeFile(file)
        }
      }
      else {
        // 表示需要壓縮，壓縮完後刪除該檔案
        await archiveFile(archiveFormat, file)
        await removeFile(file)
      }
      
      archiveUnsetLock(archiveFormat)
      
    }
    catch (e) {
      var today = new Date();
      var time = today.getHours() + '' + today.getMinutes()
      fs.writeFileSync(file + '-' + archiveFormat + '-' + time + '.error.txt', e.stack)
      archiveUnsetLock(archiveFormat)
      throw e
    } 
  } // for (let len = output.length, i = len; i > 0; i--) {

}