
const path = require('path')

const Segment = require('novel-segment');
// 创建实例
var segment = new Segment();
// 使用默认的识别模块及字典，载入字典文件需要1秒，仅初始化时执行一次即可
segment.useDefault();
//segment.loadStopwordDict('stopword.txt');


function extractKeywordsFromFilenameList(list, top = 3) {
  let text = list.join('\n ')
  
  let segmentResult = segment.doSegment(text, {
    stripPunctuation: true
  })
  
  let freq = countFrequency(segmentResult)
  
  freq.sort((a, b) => {
    return b.freq - a.freq
  })
  
  return freq.map(w => w.word).slice(0, top).join(' ')
}

function countFrequency(segmentResult) {
  let wordMap = {}
  
  segmentResult.forEach(({w}) => {
    if (!wordMap[w]) {
      wordMap[w] = 0
    }
    
    wordMap[w]++
  })
  
  let wordArray = Object.keys(wordMap).map(w => {
    return {
      word: w,
      freq: wordMap[w]
    }
  })
  
  return wordArray
}

module.exports = extractKeywordsFromFilenameList