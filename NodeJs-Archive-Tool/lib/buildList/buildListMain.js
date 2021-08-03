
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

const os = require('os')
const mv = require('mv');

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
  
  let tmpFile = os.tmpdir() + '/' + path.basename(file) + '_' + dayjs(stats.ctime).format('YYYYMMDD-hhmm') + '.list'
  let tmpFilePath

  if (fs.existsSync(tmpFile)) {
    //fs.unlinkSync(targetFile)
    await trash(tmpFile)
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
      let result = await addFileListRowCSV(attrs, tmpFile)
      //console.log(result)
      if (result) {
        tmpFilePath = result
      }
    }
    else if (format === 'sqlite') {
      let result = await addFileListRowSQLite(attrs, tmpFile, handlers)
      handlers = result.handlers
      tmpFilePath = result.targetFilePath
    }
    //console.log('清單整理睡覺中', f)
    //await sleep(1000)

    lastStatus = await progressIndicator(file, (listLen - j), listLen, lastStatus)

  } // for (let listLen = fileList.length, j = listLen; j > 0; j--) {


  // --------------------------

  if (handlers && handlers.closeHandler) {
    handlers.closeHandler()
  }
  
  // -----------------------------
  
  //console.log(compress, targetFilePath)
  outputFile = tmpFilePath
  if (compress !== false) {
    tmpFilePath = await archiveFile(compress, tmpFilePath)
    await removeFile(targetFilePath)
  }
  
  // --------------------------
  
  if (fs.existsSync(targetFile)) {
    //fs.unlinkSync(targetFile)
    await trash(targetFile)
  }
  
  //fs.renameSync(tmpFile, targetFile)
  targetFilePath = path.dirname(targetFile) + '/' + path.basename(tmpFilePath)
  //fs.renameSync(tmpFilePath, targetFilePath)
  mv(tmpFilePath, targetFilePath, (err) => {
    throw err
  })
  
  outputFile = targetFilePath
  
  // -----------------------------
  
  //console.log('buildListMain', 3.6, targetFilePath)

  //console.log(fileList)
  //console.log(targetFilePath)

  //throw Error('move to folder: ' + moveToFolder)

  if (moveToFolder === true) {
    let moveToFolderPath = file + '/' + path.basename(outputFile)
    //throw moveToFolder
    mv(outputFile, moveToFolderPath, (err) => {
      throw err
    })
    outputFile = moveToFolderPath
  }
  
  // -------------------
  
  if (lastStatus 
          && lastStatus.indicatorFileName 
          && fs.existsSync(lastStatus.indicatorFileName)) {
    fs.unlinkSync(lastStatus.indicatorFileName)
  }

  //console.log('buildListMain', 9)
  
  return outputFile
}