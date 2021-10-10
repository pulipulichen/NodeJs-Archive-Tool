/* global __dirname */

const path = require('path')

const hasFace = require('./../lib/bundlePhotos/hasFace.js')
let main = async function () {
  console.log(await hasFace(path.resolve(__dirname, './img.jpg') ))
}

main()