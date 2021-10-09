const fs = require('fs')
const path = require('path')

const dayjs = require('dayjs')
const getFilesInDirectory = require('./../fileList/getFilesInDirectory.js')
const getDirectories = require('./../fileList/getDirectories.js')
const extractKeywordsFromFilenameList = require('./extractKeywordsFromFilenameList.js')
const moveFilesToBundle = require('./moveFilesToBundle.js')
const buildWeightedFilelist = require('./buildWeightedFilelist.js')
const createBundleNames = require('./createBundleNames.js')
const createBundleOfFiles = require('./createBundleOfFiles.js')
const sortFiles = require('./sortFiles.js')

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


module.exports = bundleFilesMain