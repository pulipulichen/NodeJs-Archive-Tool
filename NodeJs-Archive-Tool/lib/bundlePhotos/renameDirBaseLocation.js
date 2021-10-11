const fs = require('fs')
const path = require('path')

const getFilelistFromFolder = require('./../fileList/getFilelistFromFolder.js')
const getDistName = require('./getDistName.js')

const exifr = require('exifr')
const cache = require('./../cache/node-cache-sqlite.js')

const deleteFolderRecursive = require('./../fileRemove/deleteFolderRecursive.js')
const fileMove = require('./../fileMove/fileMove.js')

const getDirectories = require('./../fileList/getDirectories.js')

const renameDirBaseLocation = async function (dir) {
  let dirList = await getDirectories(dir)
  
  for (let i = 0; i < dirList.length; i++) {
    let dirpath = dirList[i]
    
    let fileList = await getFilelistFromFolder(dirpath)

    // 只選擇jpg跟png
    fileList = fileList.filter(f => (f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.jpg')))

    let mainGPS
    let hasGPSCount = 0
    let fileCount = fileList.length

    for (let i = 0; i < fileCount; i++) {
      let filename = fileList[i]

      try {
        let {latitude, longitude} = await exifr.gps(filename)
        //console.log(filename, latitude, longitude)
        //let dist = await getDistName(latitude, longitude)
        //console.log(dist)
        hasGPSCount++
        if (!mainGPS) {
          mainGPS = {
            latitude,
            longitude
          }
        }
      }
      catch (e) {
        // do nothing
      }

    }

    //console.log(fileCount, hasGPSCount, (hasGPSCount / fileCount))

    // ----------------------------

    let doRename = false
    if (fileCount >= 5 && (hasGPSCount / fileCount) > 0.5) {
      doRename = true
    }
    else if (fileCount >= 2 
            && fileCount < 5
            && hasGPSCount > 2) {
      doRename = true
    }
    else if (fileCount === 1 
            && hasGPSCount === 1) {
      doRename = true
    }

    if (doRename === false) {
      //return false
      continue
    }

    // ------------------------

    let dist = await cache.get('gps', `${mainGPS.latitude},${mainGPS.longitude}`, async () => {
      return await getDistName(mainGPS.latitude, mainGPS.longitude)
    })

    if (!dist || dist === '') {
      //return false
      continue
    }

    dist = '@' + dist + ' '

    let basename = path.basename(dirpath)
    if (basename.startsWith('/')) {
      basename = basename.slice(1)
    }
    let part1 = basename.slice(0, 9)
    let part2 = basename.slice(9)

    if (part2.startsWith(dist)) {
      //return false
      continue
    }

    let toPath = path.resolve(path.dirname(dirpath), part1 + dist + part2)
    console.log(dirpath, toPath)
    await fileMove(dirpath, toPath)
  }
}

module.exports = renameDirBaseLocation