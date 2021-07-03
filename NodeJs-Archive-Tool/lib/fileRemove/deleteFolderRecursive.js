const fs = require('fs');
const path = require('path');

const sleep = require('./../await/sleep.js')
const trash = require('./../fileRemove/trashFile.js')

const deleteFolderRecursive = async function (directoryPath) {
  if (fs.existsSync(directoryPath)) {
    let list = fs.readdirSync(directoryPath)
    for (let index = 0; index < list.length; index++) {
      let file = list[index]
      let curPath = path.join(directoryPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        //fs.unlinkSync(curPath);
        await trash(curPath)
      }
    };
    
    while (true) {
      try {
        //fs.rmdirSync(directoryPath);
        await trash(directoryPath)
        break
      }
      catch (e) {
        await sleep(1000)
      }
    }
  }
};

module.exports = deleteFolderRecursive