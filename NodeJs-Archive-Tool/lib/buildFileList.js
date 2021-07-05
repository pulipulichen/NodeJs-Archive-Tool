/* global __dirname */

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

let progressIndicator

let trash

function loadPackages () {
  getFileAndDirFromFolder = require('./fileList/getFileAndDirFromFolder.js')
  getFileAttributes = require('./fileAttributes/getFileAttributes.js')

  sleep = require('./await/sleep.js')

  addFileListRowCSV = require('./buildList/addFileListRowCSV.js')
  addFileListRowSQLite = require('./buildList/addFileListRowSQLite.js')

  dayjs = require('dayjs')

  archiveFile = require('./archive/archiveFile.js')
  removeFile = require('./fileRemove/removeFile.js')

  progressIndicator = require('./progressIndicator/progressIndicator.js')
  
  trash = require('./fileRemove/trashFile.js')
}


module.exports = async function (options = {}) {
  let { 
    format = 'csv',
    compress = false,
    moveToFolder = false
  } = options
  
  let lastStatus
  let outputFile
  
  await handleFileFromArgv({
    lockKey: 'build-list',
    validateDirectory: true,
    loadPackages
  }, async (file) => {
    
    let fileList = await getFileAndDirFromFolder(file)

    const stats = fs.statSync(file)

    let targetFile = file + '_' + dayjs(stats.ctime).format('YYYYMMDD-hhmm') + '.list'
    let targetFilePath

    if (fs.existsSync(targetFile)) {
      //fs.unlinkSync(targetFile)
      await trash(targetFile)
    }

    let handlers

    lastStatus = await progressIndicator(file, 0, fileList.length, lastStatus)

    for (let listLen = fileList.length, j = listLen; j > 0; j--) {
      let f = fileList[(listLen - j)]

      let attrs = await getFileAttributes(f, {
        ...options,
        baseDir: file
      })

      //console.log(attrs)

      if (format === 'csv') {
        let result = await addFileListRowCSV(attrs, targetFile)
        //console.log(result)
        if (result) {
          targetFilePath = result
        }
      }
      else if (format === 'sqlite') {
        let result = await addFileListRowSQLite(attrs, targetFile, handlers)
        handlers = result.handlers
        targetFilePath = result.targetFilePath
      }
      //await sleep(10000)

      lastStatus = await progressIndicator(file, (listLen - j), listLen, lastStatus)

    } // for (let listLen = fileList.length, j = listLen; j > 0; j--) {

    if (handlers && handlers.closeHandler) {
      handlers.closeHandler()
    }

    if (lastStatus 
            && lastStatus.indicatorFileName 
            && fs.existsSync(lastStatus.indicatorFileName)) {
      fs.unlinkSync(lastStatus.indicatorFileName)
    }

    //console.log(fileList)
    //console.log(targetFilePath)

    //console.log(compress, targetFilePath)
    outputFile = targetFilePath
    if (compress !== false) {
      outputFile = await archiveFile(compress, targetFilePath)
      await removeFile(targetFilePath)
    }

    if (moveToFolder === true) {
      let moveToFolderPath = file + '/' + path.basename(outputFile)
      fs.renameSync(outputFile, moveToFolderPath)
      outputFile = moveToFolderPath
    }
  })
  
  return outputFile
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