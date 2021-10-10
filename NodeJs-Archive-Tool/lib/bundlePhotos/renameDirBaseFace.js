/* global __dirname */

const fs = require('fs')
const path = require('path')

const canvas = require('canvas');

const getDirectories = require('./../fileList/getDirectories.js')
const getFilesInDirectory = require('./../fileList/getFilesInDirectory.js')

const exifr = require('exifr')

const nodeCacheSQLite = require('./../cache/node-cache-sqlite.js')

const sleep = require('./../await/sleep.js')
const fileMove = require('./../fileMove/fileMove.js')

const hasFace = require('./hasFace.js')

const renameDirBaseFace = async function (dir) {
  let dirList = await getDirectories(dir)
  
  for (let i = 0; i < dirList.length; i++) {
    let dirpath = dirList[i]
    
    let fileList = await getFilesInDirectory(dirpath)
    
    fileList = fileList.filter(f => (f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.jpg')))
    
    let peopleExisted = false
    for (let j = 0; j < fileList.length; j++) {
      let filepath = fileList[j]
      if (filepath.endsWith('0-preview.png')) {
        continue
      }
      
      let exif = await exifr.parse(filepath)
      //console.log(filepath)
      //console.log(exif)
      if (!exif || !exif.Orientation) {
        continue
      }
      
      
      let isImageHasFace = await nodeCacheSQLite.get('face-api', filepath, async () => {
        //await initFaceapi()
        //console.log('[FACE API]', filepath)
        return await hasFace(filepath)
      })
      if (isImageHasFace) {
        peopleExisted = true
        break
      }
    }
    
    if (peopleExisted) {
      // 修改資料夾名稱
      let parentDir = path.dirname(dirpath)
      let dirname = path.basename(dirpath)
      if (dirname.startsWith('/')) {
        dirname = dirname.slice(1)
      }
      
      let part1 = dirname.slice(0, 9)
      let part2 = dirname.slice(9)
      
      let mark = '[P]'
      
      if (part2.startsWith(mark)) {
        continue
      }
      
      let toDirname = part1 + mark + part2
      let toPath = path.resolve(parentDir, toDirname)
      //console.log(dirpath, toPath)
      
      await fileMove(dirpath, toPath)
    }
  }
}

module.exports = renameDirBaseFace