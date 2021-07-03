let fs = require('fs')
let path = require('path')

let getArgv = require('./cli/getArgv.js')
let getFileAndDirFromFolder
let getFileAttributes

let sleep

let addFileListRowCSV
let addFileListRowSQLite

let dayjs

let archiveFile
let removeFile

let archiveIsLocked
let archiveSetLock
let archiveUnsetLock

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

  archiveIsLocked = require('./lock/archiveIsLocked.js')
  archiveSetLock = require('./lock/archiveSetLock.js')
  archiveUnsetLock = require('./lock/archiveUnsetLock.js')

  progressIndicator = require('./progressIndicator/progressIndicator.js')
  
  trash = require('./fileRemove/trashFile.js')
}

module.exports = async function (options) {
  
  let { 
    format = 'csv',
    compress = false,
    moveToFolder = false
  } = options
  
  let outputFile
  
  let output = getArgv()
  
  let lockKey = 'build-list'
  
  let lastStatus
  //let file = output.join('')
  for (let len = output.length, i = len; i > 0; i--) {
    let file = output[(len - i)]
    
    try {
      
      if (!sleep) {
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

      let fileList = await getFileAndDirFromFolder(file)

      const stats = fs.statSync(file)

      let targetFile = file + '_' + dayjs(stats.ctime).format('YYYYMMDD-hhmm') + '.list'
      let targetFilePath

      if (fs.existsSync(targetFile)) {
        //fs.unlinkSync(targetFile)
        await trash(targetFile)
      }

      let fileHandler

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
          let result = await addFileListRowSQLite(attrs, targetFile, fileHandler)
          fileHandler = result.fileHandler
          targetFilePath = result.targetFilePath
        }
        //await sleep(10000)

        lastStatus = await progressIndicator(file, (listLen - j), listLen, lastStatus)

      } // for (let listLen = fileList.length, j = listLen; j > 0; j--) {

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
      
      archiveUnsetLock(lockKey)
    }
    catch (e) {
      var today = new Date();
      var time = today.getHours() + '' + today.getMinutes()
      fs.writeFileSync(file + '-file-list-' + time + '.error.txt', e.stack)
      archiveUnsetLock(lockKey)
      
      throw e
    } 
    
    
    // --------------------------
  } // for (let len = output.length, i = len; i > 0; i--) {

  return outputFile
}