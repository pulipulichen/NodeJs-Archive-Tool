/* global __dirname, Promise */

const handleFileFromArgv = require('./cli/handleFileFromArgv.js')

let fs = require('fs')
let path = require('path')

// -------------------------------

let getFileAndDirFromFolder
let getFileAttributes

let sleep

let addFileListRowCSV
let addFileListRowSQLite

let dayjs

let archiveFile
let removeFile

let buildFileList
let listArchiveFiles
let getFilesInDirectory

function loadPackages () {
  //console.log('有載入嗎？')
  
  getFileAndDirFromFolder = require('./fileList/getFileAndDirFromFolder.js')
  getFileAttributes = require('./fileAttributes/getFileAttributes.js')
  
  getFilesInDirectory = require('./fileList/getFilesInDirectory.js')
  
  sleep = require('./await/sleep.js')

  addFileListRowCSV = require('./buildList/addFileListRowCSV.js')
  addFileListRowSQLite = require('./buildList/addFileListRowSQLite.js')

  dayjs = require('dayjs')

  archiveFile = require('./archive/archiveFile.js')
  removeFile = require('./fileRemove/removeFile.js')

  buildListMain = require('./buildList/buildListMain.js')
  listArchiveFiles = require('./listArchiveFiles.js')
}


module.exports = async function (options = {}) {
  let { 
    format = 'csv',
    compress = false,
    archiveFormat = '7z'
  } = options
  
  await handleFileFromArgv({
    lockKey: false,
    validateDirectory: true,
    loadPackages: loadPackages
  }, async (file) => {
    
    //console.log(file)
    
    // 要排除掉已經處理過的檔案
    let filesInDir = await getFilesInDirectory(file)
    if (filesInDir.length === 2) {
      let hasArchive = false
      let hasList = false
      filesInDir.forEach(f => {
        if (f.endsWith('.' + format)) {
          hasList = true
        }
        else if (f.endsWith('.' + archiveFormat)) {
          hasArchive = true
        }
      })
      if (hasArchive && hasList) {
        // 確認已經有檔案了
        return true
      }
    }
    
    // --------------------------------
    
    //console.log('gogogo')
    
    let list = await buildListMain(file, options)
    
    //console.log('[[[LIST]]]', list, file)
    
    let archive = await archiveFile(archiveFormat, file)
    //console.log('[[[archive]]]', archive)
    //console.log(' ')
    
    //await removeFile(file)
    filesInDir = await getFilesInDirectory(file)
    //console.log(filesInDir)
    if (filesInDir.length > 0) {
      await Promise.all(filesInDir.map(async (f) => {
        await removeFile(f)
      }))
    }

    //console.log('prepare to mkdir:', file)
    /*
    let notPassed = true
    while (notPassed) {
      try {
        fs.mkdirSync(file)
        notPassed = false
      } catch (e) {
        await sleep(500)
      }
    }
    */
    fs.renameSync(list, file + '/' + path.basename(list))
    fs.renameSync(archive, file + '/' + path.basename(archive))
  })
}


/*
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
 */