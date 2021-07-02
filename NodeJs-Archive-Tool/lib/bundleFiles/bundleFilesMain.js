const fs = require('fs')
const path = require('path')

const dayjs = require('dayjs')
const getFilesInDirectory = require('./../fileList/getFilesInDirectory.js')
const extractKeywordsFromFilenameList = require('./extractKeywordsFromFilenameList.js')

async function bundleFilesMain (options, dir) {
  
  let { 
    bundleIntervalHours = 2,
  } = options
  
  // -------------------
  
  let files = await getFilesInDirectory(dir)
  
  // 先按照建立時間順序排序
  let filesObjectSorted = sortFiles(files)
  
  let bundles = createBundleOfFiles(filesObjectSorted, bundleIntervalHours)
  
  let bundleNames = createBundleNames(bundles)
}

function sortFiles (files) {
  let fileObjects = files.map(file => {
    let ctime = fs.lstatSync(file).ctime
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
  
  let intervalMS = bundleFilesMain * 60 * 60 * 1000
  
  fileObjects.forEach(fileObject => {
    if (!lastCtimeUnix) {
      currentBundle.push(fileObject)
      lastCtimeUnix = fileObject.ctimeUnix
    }
    
    if (fileObject.ctimeUnix - lastCtimeUnix > intervalMS) {
      bundles.push(currentBundle)
      
      currentBundle = []
    }
    
    currentBundle.push(fileObject)
  })
  
  if (currentBundle.length !== 0) {
    bundles.push(currentBundle)
  }
  
  return bundles
}

function createBundleNames (bundles) {
  return bundles.map(bundle => {
    let ctime = bundle[0].ctime
    let dateString = dayjs(ctime).format('YYYYMMDD')
    
    let filenameList = buildWeightedFilelist(bundle)
    let keyword = extractKeywordsFromFilenameList(filenameList)
    
    return dateString + ' ' + dateString
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