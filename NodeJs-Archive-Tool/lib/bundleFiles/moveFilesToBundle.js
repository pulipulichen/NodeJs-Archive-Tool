const fs = require('fs')
const path = require('path')
const sleep = require('./../await/sleep.js')

const fileMove = require('./../fileMove/fileMove.js')

async function moveFilesToBundle(dir, bundles, bundleNames) {
  let output = []
  
  for (let i = 0; i < bundles.length; i++) {
    let fileObjects = bundles[i]
    let bundleName = bundleNames[i]
    let bundleDir = dir + '/' + bundleName
    
    if (fs.existsSync(bundleDir) === false) {
      fs.mkdirSync(bundleDir)
    }
    
    for (let j = 0; j < fileObjects.length; j++) {
      let file = fileObjects[j]
      let filepath = file.file
      //console.log(file, bundleDir + '/' + path.basename(file))
      if (fs.existsSync(filepath) === false) {
        //return true
        console.log('[ERROR] File not found: ', bundleName, filepath)
        continue
      }
      
      if (path.basename(filepath) === bundleName) {
        //return false
        console.log('[ERROR] Same name: ', bundleName, filepath)
        continue
      }
      
      await fileMove(filepath, bundleDir + '/' + path.basename(filepath))
      //while (true) { 
        //try {
          // fs.renameSync(file, bundleDir + '/' + path.basename(file))
        //  break
        //}
        //catch (e) {
        //  await sleep(1000)
        //}
      //}
    }
//    
//    fileObjects.forEach(({file}) => {
//      
//    })
    
    //return bundleDir
    output.push(bundleDir)
  }
  
  return output
}

module.exports = moveFilesToBundle