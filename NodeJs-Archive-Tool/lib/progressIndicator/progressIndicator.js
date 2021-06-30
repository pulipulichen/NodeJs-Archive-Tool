const fs = require('fs')
const path = require('path')

const dayjs = require('dayjs')

function progressIndicator(file, i, len, lastStatus = {}) {
  
  let percent = Math.ceil((i / len) * 100) 
  
  if (percent === lastStatus.percent) {
    return lastStatus
  }
  
  // ---------------------
  
  let newIndicatorFileName = file + '.' + percent + '%-1753.txt'
  fs.renameSync(lastStatus.indicatorFileNmae, newIndicatorFileName)
  
  lastStatus.indicatorFileNmae = newIndicatorFileName
  
  // ---------------------
  
  if (!lastStatus.startTime) {
    lastStatus.startTime = (new Date()).getTime()
  }
  
  return lastStatus
}

function predictFinishTime (percent, startTime) {
  
  let currentTime = (new Date()).getTime()
  let intervalTime = currentTime - startTime
  
  
}

module.exports = progressIndicator