const fs = require('fs')
const path = require('path')

const dayjs = require('dayjs')

function progressIndicator(file, i, len, lastStatus = {}) {
  
  let percent = Math.ceil((i / len) * 100) 
  //console.log(percent)
  if (percent === 100 && lastStatus.indicatorFileName) {
    fs.unlinkSync(lastStatus.indicatorFileName)
    return undefined
  }
  
  if (percent === lastStatus.percent) {
    return lastStatus
  }
  
  // ---------------------
  
  //let newIndicatorFileName = file + '.' + percent + '%' + predictFinishTime(percent, lastStatus.startTime) + '.txt'
  let newIndicatorFileName = path.dirname(file) + '/[' + percent + '%' + predictFinishTime(percent, lastStatus.startTime) + '] ' + path.basename(file) + '.txt'
  //console.log(newIndicatorFileName)
  if (!lastStatus.indicatorFileName) {
    fs.writeFileSync(newIndicatorFileName, file)
  }
  else {
    fs.renameSync(lastStatus.indicatorFileName, newIndicatorFileName)
  }
  
  lastStatus.indicatorFileName = newIndicatorFileName
  
  // ---------------------
  
  if (!lastStatus.startTime) {
    lastStatus.startTime = (new Date()).getTime()
  }
  
  return lastStatus
}

function predictFinishTime (percent, startTime) {
  
  if (!startTime || percent === 0) {
    return ''
  }
  
  let currentTime = (new Date()).getTime()
  let intervalTime = currentTime - startTime
  
  let predictIntervalTime = Math.floor((intervalTime / percent) * 100)
  let predictDate = new Date(startTime + predictIntervalTime)
  
  return ' ' + dayjs(predictDate).format('HHmm')
}

module.exports = progressIndicator