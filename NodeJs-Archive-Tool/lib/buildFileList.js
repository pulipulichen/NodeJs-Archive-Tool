const fs = require('fs')
const getArgv = require('./cli/getArgv.js')
const getFileAndDirFromFolder = require('./fileList/getFileAndDirFromFolder.js')
const getFileAttributes = require('./fileAttributes/getFileAttributes.js')

const sleep = require('./await/sleep.js')

const addFileListRowCSV = require('./buildList/addFileListRowCSV.js')
const addFileListRowSQLite = require('./buildList/addFileListRowSQLite.js')

const dayjs = require('dayjs')

module.exports = async function (options) {
  
  let { format = 'csv' } = options
  
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
    
    let fileList = await getFileAndDirFromFolder(file)
    let targetFile = file + dayjs().format('YYYYMMDD-hhmm') + '.list'
    
    if (fs.existsSync(targetFile)) {
      fs.unlinkSync(targetFile)
    }
    
    let fileHandler
    
    for (let listLen = fileList.length, j = listLen; j > 0; j--) {
      let f = fileList[(listLen - j)]
      
      let attrs = await getFileAttributes(f, {
        ...options,
        baseDir: file
      })
      
      //console.log(attrs)
      
      if (format === 'csv') {
        await addFileListRowCSV(attrs, targetFile)
      }
      else if (format === 'sqlit') {
        fileHandler = await addFileListRowSQLite(attrs, targetFile, fileHandler)
      }
      //await sleep(3000)
    }
    
    //console.log(fileList)
    
    // --------------------------
  } // for (let len = output.length, i = len; i > 0; i--) {

}