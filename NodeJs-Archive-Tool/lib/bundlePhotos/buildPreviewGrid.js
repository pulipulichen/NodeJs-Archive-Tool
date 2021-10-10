const fs = require('fs')
const path = require('path')

const getDirectories = require('./../fileList/getDirectories.js')
const getFilesInDirectory = require('./../fileList/getFilesInDirectory.js')

const { createCollage } = require('@wylie39/image-collage');
const previewFilename = '0.preview.png'

const buildPreviewGrid = async function (dir) {
  let dirList = await getDirectories(dir)
  
  for (let i = 0; i < dirList.length; i++) {
    let dirpath = dirList[i]
    
    let filelist = await getFilesInDirectory(dirpath)
    filelist = filelist.filter(f => !f.endsWith(previewFilename))
      .filter(f => (f.endsWith('.png') || f.endsWith('.jpeg') || f.endsWith('.jpg')))
    
    if (filelist.length < 2) {
      continue
    }
    
    //console.log(dirpath)
    //console.log(filelist)
    await buildCollage(filelist)
    //console.log(dirpath)
    //console.log(filelist)
    
  }
}

const buildCollage = function (photos) {
  const collageWidth = 500;
  let outputPath = path.resolve(path.dirname(photos[0]), previewFilename)
  if (fs.existsSync(outputPath)) {
    return outputPath
  }

  return new Promise((resolve) => {
    createCollage(photos, collageWidth).then((imageBuffer) => {
      fs.writeFileSync(outputPath, imageBuffer);
      resolve(outputPath)
    });
  })
}

module.exports = buildPreviewGrid