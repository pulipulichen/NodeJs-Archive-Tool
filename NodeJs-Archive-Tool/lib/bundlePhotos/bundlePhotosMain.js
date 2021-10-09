const fs = require('fs')
const path = require('path')

const dayjs = require('dayjs')
const getFilesInDirectory = require('./../fileList/getFilesInDirectory.js')
const getDirectories = require('./../fileList/getDirectories.js')

const extractKeywordsFromFilenameList = require('./../bundleFiles/extractKeywordsFromFilenameList.js')
const moveFilesToBundle = require('./../bundleFiles/moveFilesToBundle.js')

const createBundleNames = require('./../bundleFiles/createBundleNames.js')
const createBundleOfFiles = require('./../bundleFiles/createBundleOfFiles.js')
const sortFiles = require('./../bundleFiles/sortFiles.js')

const moveBackTempDir = require('./../bundleFiles/moveBackTempDir.js')
const moveToTempDir = require('./../bundleFiles/moveToTempDir.js')

const flatFilesDirectories = require('./../fileList/flatFilesDirectories.js')

const renameDirBaseLocation = require('./renameDirBaseLocation.js')
const prependDateFromExif = require('./prependDateFromExif.js')

const moveDirToYYYYMMDir = require('./../fileList/moveDirToYYYYMMDir.js')
const buildPreviewGrid = require('./buildPreviewGrid.js')

async function bundlePhotosMain (options, dir) {
  
  let { 
    bundleIntervalHours = 2,
  } = options
  
  // -------------------
  
  await moveToTempDir(dir)
  //return false
  
  await flatFilesDirectories(dir)
  await prependDateFromExif(dir)
  
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
  let bundleDirList = await moveFilesToBundle(dir, bundles, bundleNames)
  //console.log(bundleDirList)
  
  for (let i = 0; i < bundleDirList.length; i++) {
    await renameDirBaseLocation(bundleDirList[i])
  }
  //console.log(bundleNames)
  
  await moveBackTempDir(dir)
  
  await buildPreviewGrid(dir)
  
  await moveDirToYYYYMMDir(dir)
}


module.exports = bundlePhotosMain