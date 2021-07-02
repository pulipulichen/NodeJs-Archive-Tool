const buildFileList = require('./lib/buildFileList.js')
buildFileList({
  fulltext: true,
  format: 'sqlite',
  compress: 'zip',
  moveToFolder: true
})