const fs = require('fs')
const path = require('path')

const getArgv = require('./cli/getArgv.js')
const getFileAndDirFromFolder = require('./fileList/getFileAndDirFromFolder.js')
const getFileAttributes = require('./fileAttributes/getFileAttributes.js')

const sleep = require('./await/sleep.js')

const addFileListRowCSV = require('./buildList/addFileListRowCSV.js')
const addFileListRowSQLite = require('./buildList/addFileListRowSQLite.js')

const dayjs = require('dayjs')

const archiveFile = require('./archive/archiveFile.js')
const removeFile = require('./fileRemove/removeFile.js')

const buildFileList = require('./buildFileList.js')
const listArchiveFiles = require('./listArchiveFiles.js')

module.exports = async function (options) {
  
  let { 
    format = 'csv',
    compress = false,
    archiveFormat = '7z'
  } = options
  
  let output = getArgv()
  //let file = output.join('')
  for (let len = output.length, i = len; i > 0; i--) {
    let file = output[(len - i)]
    
    //console.log(file, fs.existsSync(file))

    if (fs.existsSync(file) === false
          || fs.lstatSync(file).isDirectory() === false) {
      return false
    }

    // --------------------------
    //console.log(options)
    let list = await buildFileList(options)
    //console.log('[[[LIST]]]', list, file)
    let archive = await archiveFile(archiveFormat, file)
    console.log('[[[archive]]]', archive)
    await removeFile(file)
    
    fs.mkdirSync(file)
    fs.renameSync(list, file + '/' + path.basename(list))
    fs.renameSync(archive, file + '/' + path.basename(archive))
    
  } // for (let len = output.length, i = len; i > 0; i--) {

}