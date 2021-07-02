const fs = require('fs')
const path = require('path')

const getArgv = require('./cli/getArgv.js')

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

function loadPackages () {
  getFileAndDirFromFolder = require('./fileList/getFileAndDirFromFolder.js')
  getFileAttributes = require('./fileAttributes/getFileAttributes.js')

  sleep = require('./await/sleep.js')

  addFileListRowCSV = require('./buildList/addFileListRowCSV.js')
  addFileListRowSQLite = require('./buildList/addFileListRowSQLite.js')

  dayjs = require('dayjs')

  archiveFile = require('./archive/archiveFile.js')
  removeFile = require('./fileRemove/removeFile.js')

  buildFileList = require('./buildFileList.js')
  listArchiveFiles = require('./listArchiveFiles.js')
}

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
    try {
      
      if (!sleep) {
        loadPackages()
      }

      if (fs.existsSync(file) === false) {
        continue
      }
      
      if (fs.lstatSync(file).isDirectory() === false) {
        throw Error(file + ' should be a directory.')
      }

      // --------------------------
      //console.log(options)
      let list = await buildFileList(options)
      //console.log('[[[LIST]]]', list, file)
      let archive = await archiveFile(archiveFormat, file)
      //console.log('[[[archive]]]', archive)
      //console.log(' ')
      await removeFile(file)

      //console.log('prepare to mkdir:', file)
      let notPassed = true
      while (notPassed) {
        try {
          fs.mkdirSync(file)
          notPassed = false
        }
        catch (e) {
          await sleep(500)
        }
      }
      fs.renameSync(list, file + '/' + path.basename(list))
      fs.renameSync(archive, file + '/' + path.basename(archive))
    }
    catch (e) {
      var today = new Date();
      var time = today.getHours() + '' + today.getMinutes()
      fs.writeFileSync(file + '-file-list-archive-' + time + '.error.txt', e.stack)
      archiveUnsetLock(lockKey)
      
      throw e
    } 
    
    
  } // for (let len = output.length, i = len; i > 0; i--) {

}