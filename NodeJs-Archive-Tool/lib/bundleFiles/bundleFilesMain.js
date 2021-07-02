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
  
  // 確認是否有類似資料夾的名字
  await moveFilesToBundle(dir, bundles, bundleNames)
  
  //console.log(bundleNames)
}

function sortFiles (files) {
  let fileObjects = files.map(file => {
    let ctime = fs.lstatSync(file).ctime
//    if (file.endsWith('2016年的檔案.csv')) {
//      ctime = dayjs('20160101').toDate()
//    }
    
    let parse = path.parse(file)
    
    let ext = parse.ext
    if (typeof(ext) === 'string' && ext.startsWith('.')) {
      ext = ext.slice(1)
    }
    
    return {
      file,
      filename: parse.name,
      ext,
      ctime,
      ctimeUnix: ctime.getTime()
    }
  })
  
  fileObjects.sort((a, b) => {
    return a.ctimeUnix - b.ctimeUnix
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
      lastCtimeUnix = fileObject.ctimeUnix
      return true
    }
    
    //console.log(fileObject.ctimeUnix - lastCtimeUnix, intervalMS)
    if (fileObject.ctimeUnix - lastCtimeUnix > intervalMS) {
      bundles.push(currentBundle)
      
      currentBundle = []
    }
    
    currentBundle.push(fileObject)
    lastCtimeUnix = fileObject.ctimeUnix
  })
  
  if (currentBundle.length !== 0) {
    bundles.push(currentBundle)
  }
  
  return bundles
}

function createBundleNames (bundles, dir, subdirs) {
  return bundles.map(bundle => {
    let ctime = bundle[0].ctime
    let dateString = dayjs(ctime).format('YYYYMMDD')
    
    // 先確認看看有沒有跟這個日期一樣的子資料夾
    for (let i = 0; i < subdirs.length; i++) {
      if (subdirs[i].startsWith(dateString)) {
        return subdirs[i]
      }
    }
    
    let filenameList = buildWeightedFilelist(bundle)
    let keyword = extractKeywordsFromFilenameList(filenameList)
    
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