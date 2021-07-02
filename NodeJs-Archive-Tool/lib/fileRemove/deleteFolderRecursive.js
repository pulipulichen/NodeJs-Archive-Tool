const fs = require('fs');
const path = require('path');

const sleep = require('./../await/sleep.js')

const deleteFolderRecursive = async function (directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file, index) => {
      const curPath = path.join(directoryPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    
    while (true) {
      try {
        fs.rmdirSync(directoryPath);
        break
      }
      catch (e) {
        await sleep(1000)
      }
    }
  }
};

module.exports = deleteFolderRecursive