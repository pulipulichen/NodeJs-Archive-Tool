/* global baseDir */

const path = require('path')
const fs = require('fs')

const mime = require('mime-types')
const extractFulltext = require('./extractFulltext.js')
const getDirTotalSize = require('./getDirTotalSize.js')

const config = require('./../../config.js')

module.exports = async function (filepath, options) {

//let filepath = "D:\\xampp\\htdocs\\projects-autoit\\AutoIt-Archive-Util\\[Document\\20210329-zip\\zip_002.zip"
  let { baseDir = ''} = options

  let output = {}

  output.filepath = path.dirname(filepath)
  if (output.filepath.startsWith(baseDir)) {
    output.filepath = output.filepath.slice(baseDir.length)
    
    if (output.filepath === '') {
      output.filepath = '/'
    }
  }
  
  const stats = fs.statSync(filepath)
  output.isDir = stats.isDirectory()
  
  output.filename = path.basename(filepath)
  
  output.ext = null
  output.mime = null
  
  if (output.isDir === false) {
    output.ext = path.extname(filepath)
    if (output.ext.startsWith('.')) {
      output.ext = output.ext.slice(1)
    }
    output.mime = mime.lookup(filepath)
  }
  
  if (output.isDir === true) {
    output.size = getDirTotalSize(filepath)
  }
  else {
    output.size = stats.size
  }
  
  output.created_time = stats.ctime
  output.modified_time = stats.mtime
  
  output.fulltext = null
  if (options.fulltext === true
          && output.isDir === false
          && config.fulltext.allowMIME.indexOf(output.mime) > -1) {
    output.fulltext = await extractFulltext(filepath)
  }

  return output
}