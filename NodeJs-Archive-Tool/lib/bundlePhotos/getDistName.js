
const https = require("https")
const localConfig = require('./../../local-config.js')

const getDistName = function (latitude, longitude) {
  let key = localConfig.opencageAPIKey
  //console.log(key, localConfig)
  if (!key || key === '') {
    throw Error('Please register Geocoding API Key in local.config.js')
  }
  
  return new Promise((resolve) => {
    
    let url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}%2C${longitude}&key=${key}&language=zh`
    //console.log(url)
    // 
    // 23.0817471
    // 120.58743379972222
    // 23.0817471,120.58743379972222
    // 
    // 使用 http 中 get 方法
    https.get(url, function(response){
        var data = '';
        // response event 'data' 當 data 陸續接收的時候，用一個變數累加它。
        response.on('data', function(chunk){
            data += chunk;
        });
        // response event 'end' 當接收 data 結束的時候。
        response.on('end', function(){
            // 將 JSON parse 成物件
            data = JSON.parse(data);
            //console.log(data); // 可開啟這行在 Command Line 觀看 data 內容
            
            let components = data['results'][0]['components']
            let dist
            if (components['suburb']) {
              dist = components['suburb']
            }
            else if (components['city']) {
              dist = components['city']
            }

            resolve(dist)
        });
    }).on('error', function(e){ // http get 錯誤時
          console.log("error: ", e);
          resolve(false)
    });
  })
}

module.exports = getDistName