/* global __dirname */

const path = require('path')

const hasFace = require('./../lib/bundlePhotos/hasFace.js')
let main = async function () {
  let imageTrue = path.resolve(__dirname, './true.jpg')
  console.log(true, await hasFace(imageTrue))
  
  let imageFalse = path.resolve(__dirname, './false.jpg')
  console.log(imageFalse)
  console.log(false, await hasFace( imageFalse ))
}

main()