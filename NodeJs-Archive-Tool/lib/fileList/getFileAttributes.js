const path = require('path')
const fs = require('fs')

module.exports = function (filepath) {

//let filepath = "D:\\xampp\\htdocs\\projects-autoit\\AutoIt-Archive-Util\\[Document\\20210329-zip\\zip_002.zip"

  let output = {}

  output.filename = path.basename(filepath)
  output.filepath = filepath
  output.ext = path.extname(filepath)
  if (output.ext.startsWith('.')) {
    output.ext = output.ext.slice(1)
  }
  const stats = fs.statSync(filepath)
  output.size = stats.size
  output.modified_time = stats.mtime
  output.created_time = stats.ctime

  return output
}