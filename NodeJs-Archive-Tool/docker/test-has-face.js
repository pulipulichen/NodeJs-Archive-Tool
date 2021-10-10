/* global __dirname */

const path = require('path')

const hasFace = require('./../lib/bundlePhotos/')
let main = async function () {
  console.log(await hasFace(path.resolve(__dirname, './img.jpg') ))
}

main()