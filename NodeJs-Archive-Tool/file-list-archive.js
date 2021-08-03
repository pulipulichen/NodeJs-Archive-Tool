const buildFileListAndArchive = require('./lib/buildFileListAndArchive.js')

buildFileListAndArchive({
  fulltext: false,
  format: 'csv',
  archiveFormat: '7z',
  moveToFolder: false
})