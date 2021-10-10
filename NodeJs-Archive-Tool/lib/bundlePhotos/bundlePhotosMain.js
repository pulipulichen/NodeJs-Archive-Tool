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
const removeTempDir = require('./../bundleFiles/removeTempDir.js')

const flatFilesDirectories = require('./../fileList/flatFilesDirectories.js')

const renameDirBaseLocation = require('./renameDirBaseLocation.js')
const prependDateFromExif = require('./prependDateFromExif.js')

const moveDirToYYYYMMDir = require('./../fileList/moveDirToYYYYMMDir.js')
const buildPreviewGrid = require('./buildPreviewGrid.js')
const renameDirBaseFace = require('./renameDirBaseFace.js')

const sleep = require('./../await/sleep.js')

async function bundlePhotosMain (options, dir) {
  
  let { 
    bundleIntervalHours = 2,
  } = options
  
  // -------------------
  
  console.log('[moveToTempDir]')
  
  await moveToTempDir(dir)
  //return false
  
  console.log('[flatFilesDirectories]')
  await flatFilesDirectories(dir)
  
  //console.log('[prependDateFromExif]')
  //await prependDateFromExif(dir)
  
  await sleep(1000)
  
  let files = await getFilesInDirectory(dir)
  let subdirs = await getDirectories(dir)
  subdirs = subdirs.map(d => path.basename(d))
  
  // 先按照建立時間順序排序
  let filesObjectSorted = sortFiles(files)
  //console.log(filesObjectSorted)
  
  await sleep(1000)
  
  console.log('[createBundleOfFiles]')
  let bundles = createBundleOfFiles(filesObjectSorted, bundleIntervalHours)
  //console.log(bundles)
  
  console.log('[createBundleNames]')
  let bundleNames = createBundleNames(bundles, dir, subdirs)
  
  //console.log(bundleNames)
  //return false
  
  // 確認是否有類似資料夾的名字
  console.log('[moveFilesToBundle]')
  let bundleDirList = await moveFilesToBundle(dir, bundles, bundleNames)
  
  //return false
  //console.log(bundleDirList)
  
  console.log('[renameDirBaseLocation]')
  await sleep(1000)
  await renameDirBaseLocation(dir)
  //console.log(bundleNames)
  
  await sleep(1000)
  
  console.log('[moveBackTempDir]')
  await moveBackTempDir(dir)
  
  await sleep(1000)
  
  console.log('[renameDirBaseFace]')
  await renameDirBaseFace(dir)
  
  await sleep(1000)
  
  console.log('[buildPreviewGrid]')
  await buildPreviewGrid(dir)
  
  await sleep(1000)
  
  console.log('[moveDirToYYYYMMDir]')
  await moveDirToYYYYMMDir(dir)
  
  console.log('[removeTempDir]')
  await removeTempDir(dir)
}


module.exports = bundlePhotosMain