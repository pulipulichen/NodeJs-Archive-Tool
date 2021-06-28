const fs = require('fs')

let doAppend = function (targetFile, attrsString, resolve) {
  fs.appendFile(targetFile, attrsString, function (err) {
    if (err) throw err;

    //console.log('Saved!');
    resolve()
  });
}

module.exports = async function (attrs, targetFile) {
  
  return new Promise(resolve => {
    let keys = Object.keys(attrs)
    let attrsString = keys.map(a => attrs[a]).join(',')

    if (fs.existsSync(targetFile)) {
      fs.appendFile(targetFile, '\n', function (err) {
        if (err) throw err;
        doAppend(targetFile, attrsString, resolve)
      });
    }
    else {
      fs.appendFile(targetFile, keys.join(',') + '\n', function (err) {
        if (err) throw err;
        doAppend(targetFile, attrsString, resolve)
      });
    }
  })
}