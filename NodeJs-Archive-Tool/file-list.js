const buildFileList = require('./lib/buildFileList.js')
buildFileList({
  fulltext: false,
  format: 'csv',
  moveToFolder: true
})