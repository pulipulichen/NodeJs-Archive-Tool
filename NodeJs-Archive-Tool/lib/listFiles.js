/* global __dirname */

const fs = require('fs')
const getArgv = require('./cli/getArgv.js')
const archiveFile = require('./archive/archiveFile.js')
const removeFile = require('./fileRemove/removeFile.js')
const extractArchive = require('./archive/extractArchive.js')

module.exports = async function (archiveFormat) {
  
  let output = getArgv()
  let file = output.join('')
  
  //console.log(file, fs.existsSync(file))

  if (fs.existsSync(file) === false) {
    return false
  }

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
      //await removeFile(file)
    }
  }
  else {
    // 表示需要壓縮，壓縮完後刪除該檔案
    await archiveFile(archiveFormat, file)
    await removeFile(file)
  }
}