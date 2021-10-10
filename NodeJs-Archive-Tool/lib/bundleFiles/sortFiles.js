const dayjs = require('dayjs')
const fs = require('fs')
const path = require('path')

const sortFiles = function (files) {
  let fileObjects = []
  files.forEach(file => {
    if (file.indexOf('@Recycle') > -1
            || file.indexOf('lost+found') > -1
            || file.indexOf('.Trash-0') > -1
            || file.indexOf('.@__thumb') > -1
            || file.indexOf('@Recently-Snapshot') > -1) {
      return false
    }
    
    //console.log(file, fs.lstatSync(file))
    let time = fs.lstatSync(file).mtime
    
//    if (file.endsWith('2016年的檔案.csv')) {
//      let tmpTime = dayjs('20160101').toDate()
//      if (dayjs(time).fiff(tmpTime, 'year') < 30) {
//        time = tmpTime
//      }
//    }
    
    /**
     * if (s.match(/^\d/)) {
   // Return true
}
if (f.match(/^\d/)) {
   // Return false
}
     */
    let basename = path.basename(file)
    if (/^\d{8}/.test(basename)) {
      let dateString = basename.slice(0, 8)
      //console.log(dateString)
      try {
        let tmpTime = dayjs(dateString).toDate()
        //console.log(dayjs(time).diff(tmpTime, 'year'))
        if (dayjs(time).diff(tmpTime, 'year') < 30) {
          time = tmpTime
        }
      }
      catch (e) {
        console.error(e)
      }
    }
    else if (basename.startsWith('Screenshot_') 
            && /^\d{8}/.test(basename.slice(11))) {
      let dateString = basename.slice(11, 19)
      try {
        let tmpTime = dayjs(dateString).toDate()
        if (dayjs(time).diff(tmpTime, 'year') < 30) {
          time = tmpTime
        }
      }
      catch (e) {
        console.error(e)
      }
    }
    else if (basename.startsWith('IMG_') 
            && /^\d{8}/.test(basename.slice(4))) {
      // IMG_20210222_022912.jpg
      let dateString = basename.slice(4, 12)
      try {
        let tmpTime = dayjs(dateString).toDate()
        if (dayjs(time).diff(tmpTime, 'year') < 30) {
          time = tmpTime
        }
      }
      catch (e) {
        console.error(e)
      }
    }
    
    let parse = path.parse(file)
    
    let ext = parse.ext
    if (typeof(ext) === 'string' && ext.startsWith('.')) {
      ext = ext.slice(1)
    }
    
    fileObjects.push({
      file,
      filename: parse.name,
      ext,
      time,
      timeUnix: time.getTime()
    })
  })
  
  fileObjects.sort((a, b) => {
    return a.timeUnix - b.timeUnix
  })
  
  return fileObjects
}

module.exports = sortFiles