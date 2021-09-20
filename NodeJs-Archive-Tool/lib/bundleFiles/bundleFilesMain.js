const fs = require('fs')
const path = require('path')

const dayjs = require('dayjs')
const getFilesInDirectory = require('./../fileList/getFilesInDirectory.js')
const getDirectories = require('./../fileList/getDirectories.js')
const extractKeywordsFromFilenameList = require('./extractKeywordsFromFilenameList.js')
const moveFilesToBundle = require('./moveFilesToBundle.js')

async function bundleFilesMain (options, dir) {
  
  let { 
    bundleIntervalHours = 2,
  } = options
  
  // -------------------
  
  let files = await getFilesInDirectory(dir)
  let subdirs = await getDirectories(dir)
  subdirs = subdirs.map(d => path.basename(d))
  
  // 先按照建立時間順序排序
  let filesObjectSorted = sortFiles(files)
  //console.log(filesObjectSorted)
  
  let bundles = createBundleOfFiles(filesObjectSorted, bundleIntervalHours)
  //console.log(bundles)
  
  let bundleNames = createBundleNames(bundles, dir, subdirs)
  
  //console.log(bundleNames)
  //return false
  
  // 確認是否有類似資料夾的名字
  await moveFilesToBundle(dir, bundles, bundleNames)
  
  //console.log(bundleNames)
}

function sortFiles (files) {
  let fileObjects = []
  files.forEach(file => {
    if (file.indexOf('@Recycle') > -1
            || file.indexOf('lost+found') > -1
            || file.indexOf('@Recently-Snapshot') > -1) {
      return false
    }
    
    //console.log(file, fs.lstatSync(file))
    let time = fs.lstatSync(file).mtime
    
    if (file.endsWith('2016年的檔案.csv')) {
      let tmpTime = dayjs('20160101').toDate()
      if (dayjs(time).fiff(tmpTime, 'year') < 30) {
        time = tmpTime
      }
    }
    
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

function createBundleOfFiles (fileObjects, bundleIntervalHours) {
  let lastCtimeUnix
  let bundles = []
  let currentBundle = []
  
  let intervalMS = bundleIntervalHours * 60 * 60 * 1000
  
  fileObjects.forEach(fileObject => {
    if (!lastCtimeUnix) {
      currentBundle.push(fileObject)
      lastCtimeUnix = fileObject.timeUnix
      return true
    }
    
    //console.log(fileObject.time, fileObject.timeUnix - lastCtimeUnix, intervalMS)
    if (fileObject.timeUnix - lastCtimeUnix > intervalMS) {
      bundles.push(currentBundle)
      
      currentBundle = []
    }
    
    currentBundle.push(fileObject)
    lastCtimeUnix = fileObject.timeUnix
  })
  
  if (currentBundle.length !== 0) {
    bundles.push(currentBundle)
  }
  
  return bundles
}

function createBundleNames (bundles, dir, subdirs) {
  return bundles.map(bundle => {
    let time = bundle[0].time
    let dateString = dayjs(time).format('YYYYMMDD')
    
    // 先確認看看有沒有跟這個日期一樣的子資料夾
    for (let i = 0; i < subdirs.length; i++) {
      if (subdirs[i].startsWith(dateString)) {
        return subdirs[i]
      }
    }
    
    // ----------------
    // 如果只有一個檔案，那就用這個檔案的檔案名稱
    if (bundle.length === 1) {
      let filename = bundle[0].filename
      if (filename.startsWith(dateString)) {
        filename = filename.slice(dateString.length).trim()
        if (filename.length === 0) {
          filename = bundle[0].filename
        }
      }
      return dateString + ' ' + filename
    }
    
    // ----------------
    
    let filenameList = buildWeightedFilelist(bundle)
    let keyword = extractKeywordsFromFilenameList(filenameList, 3, dateString)
    
    while (keyword.startsWith('_')) {
      keyword = keyword.slice(1)
    }
    while (keyword.endsWith('.')) {
      keyword = keyword.slice(0, -1)
    }
    
    let bundleName = dateString + ' ' + keyword
    
    // 檢查有沒有這個資料夾
    while (fs.existsSync(dir + '/' + bundleName)) {
      bundleName = bundleName + ' (' + dayjs().format('YYYYMMDD') + ')'
    }
    
    return bundleName.trim()
  })
}

let extWight = {
  pdf: 5,
  doc: 10,
  docx: 10,
  ppt: 10,
  pptx: 10,
  ods: 10,
  odt: 10
}

function buildWeightedFilelist (bundle) {
  let filelist = []
  
  bundle.forEach(fileObject => {
    let weight = 1
    if (typeof(extWight[fileObject.ext]) === 'number') {
      weight = extWight[fileObject.ext]
    }
    
    for (let i = 0; i < weight; i++) {
      filelist.push(fileObject.filename)
    }
  })
  
  return filelist
}

module.exports = bundleFilesMain