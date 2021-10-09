
const dayjs = require('dayjs')
const fs = require('fs')

const buildWeightedFilelist = require('./buildWeightedFilelist.js')
const extractKeywordsFromFilenameList = require('./extractKeywordsFromFilenameList.js')

const createBundleNames = function (bundles, dir, subdirs) {
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

module.exports = createBundleNames