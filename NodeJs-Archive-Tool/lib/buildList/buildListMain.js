
const fs = require('fs')
const path = require('path')
const dayjs = require('dayjs')


const getFileAndDirFromFolder = require('./../fileList/getFileAndDirFromFolder.js')
const getFileAttributes = require('./../fileAttributes/getFileAttributes.js')

const progressIndicator = require('./../progressIndicator/progressIndicator.js')

const addFileListRowCSV = require('./addFileListRowCSV.js')
const addFileListRowSQLite = require('./addFileListRowSQLite.js')

const archiveFile = require('./../archive/archiveFile.js')
const removeFile = require('./../fileRemove/removeFile.js')

const sleep = require('./../await/sleep.js')

module.exports = async function (file, options = {}) {

  let fileList = await getFileAndDirFromFolder(file)

  let { 
    format = 'csv',
    compress = false,
    moveToFolder = false
  } = options

  //console.log('buildListMain', 1)

  const stats = fs.statSync(file)

  let targetFile = file + '_' + dayjs(stats.ctime).format('YYYYMMDD-hhmm') + '.list'
  let targetFilePath

  if (fs.existsSync(targetFile)) {
    //fs.unlinkSync(targetFile)
    await trash(targetFile)
  }
  
  //console.log('buildListMain', 2)

  let handlers
  let lastStatus

  lastStatus = await progressIndicator(file, 0, fileList.length, lastStatus)

  for (let listLen = fileList.length, j = listLen; j > 0; j--) {
    let f = fileList[(listLen - j)]

    //console.log('buildListMain', 3.1, f)

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
    console.log('清單整理睡覺中', f)
    await sleep(1000)

    lastStatus = await progressIndicator(file, (listLen - j), listLen, lastStatus)

  } // for (let listLen = fileList.length, j = listLen; j > 0; j--) {

  if (handlers && handlers.closeHandler) {
    handlers.closeHandler()
  }
  
  //console.log('buildListMain', 3.6, targetFilePath)

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
  
  //console.log('buildListMain', 9)
  
  return outputFile
}