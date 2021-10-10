const { readdirSync } = require('fs')

module.exports = function (source) {
  return readdirSync(source, { withFileTypes: true })
    //.filter(dirent => dirent.isDirectory())
    //.filter(dirent => !dirent.startsWith('.'))
    .map(dirent => source + '/' + dirent.name)
}