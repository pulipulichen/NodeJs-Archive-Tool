const fs = require('fs')

const removeTempDir = async function (dir) {
  let tempDir = dir + '-temp'
  
  if (!fs.existsSync(tempDir)) {
    return false
  }
  
  fs.rmdirSync(tempDir, { recursive: true })
}

module.exports = removeTempDir