const { readdirSync } = require('fs')

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .filter(dirent => !dirent.startsWith('.'))
    .map(dirent => source + '/' +dirent.name)
    
module.exports = getDirectories