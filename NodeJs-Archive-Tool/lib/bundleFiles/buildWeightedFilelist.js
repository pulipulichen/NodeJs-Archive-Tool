
let extWight = {
  pdf: 5,
  doc: 10,
  docx: 10,
  ppt: 10,
  pptx: 10,
  ods: 10,
  odt: 10
}

let buildWeightedFilelist = function (bundle) {
  let filelist = []
  
  bundle.forEach(fileObject => {
    let weight = 1
    if (typeof(extWight[fileObject.ext]) === 'number') {
      weight = extWight[fileObject.ext]
    }
    
    for (let i = 0; i < weight; i++) {
      filelist.push(fileObject.filename)
    }
  })
  
  return filelist
}

module.exports = buildWeightedFilelist