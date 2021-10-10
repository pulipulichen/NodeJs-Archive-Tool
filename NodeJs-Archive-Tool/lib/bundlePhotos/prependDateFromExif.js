const fs = require('fs')
const path = require('path')

const getFilelistFromFolder = require('./../fileList/getFilelistFromFolder.js')

const exifr = require('exifr')
const dayjs = require('dayjs')

const fileMove = require('./../fileMove/fileMove.js')
const isDateString = require('./../date/isDateString.js')

const prependDateFromExif = async function (dir) {
  let fileList = await getFilelistFromFolder(dir)
  
  fileList = fileList.filter(f => (f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.jpg')))
  
  //console.log(fileList)
  
  for (let i = 0; i < fileList.length; i++) {
    try {
      let filename = fileList[i]
      //console.log(filename)
      let basename = path.basename(filename)
      if (basename.startsWith('ScreenMaster Screenshot ')
              && isDateString(basename.slice(24, 32))) {
        let dateString = basename.slice(24, 32)
        await renameFileWithDateString(filename, dateString)
        continue
      }
      else if (basename.startsWith('Screenshots ')) {
        let dateString = basename.slice(12,16) + basename.slice(17,19) + basename.slice(20,22)
        //console.log(basename, dateString)
        if (isDateString(dateString)) {
          await renameFileWithDateString(filename, dateString)
          continue
        }
      }
        
      let exif = await exifr.parse(filename)
      //console.log(exif.DateTimeOriginal)
      if (!exif || typeof(exif.DateTimeOriginal) === 'undefined') {
        continue
      }
      
      let date = dayjs(exif.DateTimeOriginal).format('YYYYMMDD')
      //console.log(date, filename)
      
      await renameFileWithDateString(filename, date)
    }
    catch (e) {
      // do nothing
    }
  }
}

async function renameFileWithDateString (filename, dateString) {
  let basename = path.basename(filename)
  if (basename.startsWith('/')) {
    basename = basename.slice(1)
  }
  if (basename.startsWith(dateString + ' ')) {
    return false
  }
  //console.log(path.dirname(filename), date + ' ', basename)
  let toPath = path.resolve(path.dirname(filename), dateString + ' ' + basename)
  //console.log(toPath)

  await fileMove(filename, toPath)
}

module.exports = prependDateFromExif