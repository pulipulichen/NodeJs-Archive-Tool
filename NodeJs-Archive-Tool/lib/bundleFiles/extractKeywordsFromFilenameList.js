/* global __dirname */

const path = require('path')

const Segment = require('novel-segment');
// 创建实例
var segment = new Segment();
// 使用默认的识别模块及字典，载入字典文件需要1秒，仅初始化时执行一次即可
segment.useDefault();
//segment.loadStopwordDict(path.resolve(__dirname, './stopword.txt'));


function extractKeywordsFromFilenameList(list, top = 3, dateString) {
  let text = list.join(' ')
  
  let segmentResult = segment.doSegment(text, {
    stripPunctuation: true,
    stripStopword: true
  })
  
  let freq = countFrequency(segmentResult)
  
  //console.log(freq)
  
  freq.sort((a, b) => {
    if (b.freq === a.freq) {
      if (b.wordLength !== a.wordLegth) {
        return b.wordLength - a.wordLength
      }
      else {
        if (a.word > b.word) {
          return 0
        }
        else {
          return 1
        }
      }
    }
    else {
      return b.freq - a.freq
    }
  })
  
  //console.log(freq)
  
  return freq.map(w => w.word)
          .filter(w => (w !== dateString))
          .slice(0, top)
          .join(' ')
}

function isLatinString(s) {
  var i, charCode;
  for (i = s.length; i--;) {
    charCode = s.charCodeAt(i)
    if (charCode < 65 || charCode > 122)
      return charCode
  }
  return true
}

const isEnglish = /^[A-Za-z0-9]+$/;
function countFrequency(segmentResult) {
  let wordMap = {}
  
  segmentResult.forEach(({w}) => {
    w = w.trim()
    if (w.length === 0) {
      return false
    }
    
    if (!wordMap[w]) {
      wordMap[w] = 0
    }
    
    wordMap[w]++
  })
  
  let wordArray = Object.keys(wordMap).map(w => {
    
    let wordLength = w.length
    //console.log(w, isEnglish.test(w))
    if (isEnglish.test(w)) {
      wordLength = '' + wordLength
      while (wordLength.length < 10) {
        wordLength = '0' + wordLength
      }
      wordLength = Number('1.' + wordLength)
    }
    
    return {
      word: w,
      wordLength: wordLength,
      freq: wordMap[w]
    }
  })
  
  return wordArray
}

module.exports = extractKeywordsFromFilenameList