const fs = require('fs')
const path = require('path')

const getFilelistFromFolder = require('./../fileList/getFilelistFromFolder.js')

const exifr = require('exifr')
const dayjs = require('dayjs')

const prependDateFromExif = async function (dir) {
  let fileList = await getFilelistFromFolder(dir)
  
  fileList = fileList.filter(f => (f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.jpg')))
  
  //console.log(fileList)
  
  for (let i = 0; i < fileList.length; i++) {
    try {
      let filename = fileList[i]
      let exif = await exifr.parse(filename)
      //console.log(exif.DateTimeOriginal)
      if (!exif || typeof(exif.DateTimeOriginal) === 'undefined') {
        continue
      }
      
      let date = dayjs(exif.DateTimeOriginal).format('YYYYMMDD')
      //console.log(date, filename)
      
      let basename = path.basename(filename).slice(1)
      if (basename.startsWith(date + ' ')) {
        continue
      }
      //console.log(path.dirname(filename), date + ' ', basename)
      let toPath = path.resolve(path.dirname(filename), date + ' ' + basename)
      //console.log(toPath)
      fs.renameSync(filename, toPath)
      
    }
    catch (e) {
      // do nothing
    }
  }
}

module.exports = prependDateFromExif