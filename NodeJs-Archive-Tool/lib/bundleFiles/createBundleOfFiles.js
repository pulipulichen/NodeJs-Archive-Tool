
const createBundleOfFiles = function (fileObjects, bundleIntervalHours) {
  let lastCtimeUnix
  let bundles = []
  let currentBundle = []
  
  let intervalMS = bundleIntervalHours * 60 * 60 * 1000
  
  fileObjects.forEach(fileObject => {
    if (!lastCtimeUnix) {
      currentBundle.push(fileObject)
      lastCtimeUnix = fileObject.timeUnix
      return true
    }
    
    //console.log(fileObject.time, fileObject.timeUnix - lastCtimeUnix, intervalMS)
    if (fileObject.timeUnix - lastCtimeUnix > intervalMS) {
      bundles.push(currentBundle)
      
      currentBundle = []
    }
    
    currentBundle.push(fileObject)
    lastCtimeUnix = fileObject.timeUnix
  })
  
  if (currentBundle.length !== 0) {
    bundles.push(currentBundle)
  }
  
  return bundles
}

module.exports = createBundleOfFiles