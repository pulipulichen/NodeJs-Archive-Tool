const fs = require('fs')
const path = require('path')
const sleep = require('./../await/sleep.js')

async function moveFilesToBundle(dir, bundles, bundleNames) {
  return bundles.map((fileObjects, i) => {
    let bundleName = bundleNames[i]
    let bundleDir = dir + '/' + bundleName
    
    if (fs.existsSync(bundleDir) === false) {
      fs.mkdirSync(bundleDir)
    }
    
    fileObjects.forEach(({file}) => {
      //console.log(file, bundleDir + '/' + path.basename(file))
      if (fs.existsSync(file) === false) {
        return true
      }
      
      if (path.basename(file) === bundleName) {
        return false
      }
      
      //while (true) { 
        //try {
          fs.renameSync(file, bundleDir + '/' + path.basename(file))
        //  break
        //}
        //catch (e) {
        //  await sleep(1000)
        //}
      //}
    })
    
    return bundleDir
  })
}

module.exports = moveFilesToBundle