/* global __dirname */

const fs = require('fs')
const path = require('path')

let tf
let faceapi

const canvas = require('canvas');

const getDirectories = require('./../fileList/getDirectories.js')
const getFilesInDirectory = require('./../fileList/getFilesInDirectory.js')

const exifr = require('exifr')

const nodeCacheSQLite = require('./../cache/node-cache-sqlite.js')

const sleep = require('./../await/sleep.js')
const fileMove = require('./../fileMove/fileMove.js')

//const faceapi = require("@vladmandic/face-api/dist/face-api.node.js");
const modelPathRoot = "./models/tiny_face_detector";

let tinyFaceDetector;

const image = async function (file) {
  const decoded = tf.node.decodeImage(file);
  const casted = decoded.toFloat();
  const result = casted.expandDims(0);
  decoded.dispose();
  casted.dispose();
  return result;
}

const detect = async function (tensor) {
  const result = await faceapi.detectAllFaces(tensor, tinyFaceDetector);
  return result;
}

let faceAPIisReady = false
const initFaceapi = async function () {
  if (faceAPIisReady) {
    return true
  }
  
  tf = require('@tensorflow/tfjs-node')
  faceapi = require('@vladmandic/face-api');

  //console.log('initFaceapi 2')

    await faceapi.tf.setBackend("tensorflow");
    await faceapi.tf.enableProdMode();
    await faceapi.tf.ENV.set("DEBUG", false);
    await faceapi.tf.ready();

//console.log('initFaceapi 3')
  //  console.log(
  //    `Version: TensorFlow/JS ${faceapi.tf?.version_core} FaceAPI ${
  //      faceapi.version.faceapi
  //    } Backend: ${faceapi.tf?.getBackend()}`
  //  );


    //console.log("Loading FaceAPI models");
    const modelPath = path.join(__dirname, modelPathRoot);
    //console.log(faceapi.nets)
    await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
    tinyFaceDetector = new faceapi.TinyFaceDetectorOptions({
      minConfidence: 0.5,
    })

  //console.log('initFaceapi 4')
    faceAPIisReady = true
}

const hasFace = async function (input) {
  //console.log('hasFace 1')
  try {
    await initFaceapi()
  }
  catch (e) {
    return false
  }
  
  //console.log('hasFace 2')
  try {
    //let input = '/home/pudding/Documents/NetBeansProjects/[nodejs]/NodeJs-Archive-Tool/NodeJs-Archive-Tool/[test/20211009 photo/20211009 a/LINE_1578402778237.jpg'
    //console.log('[gogogo]', input)
    input = fs.readFileSync(input)
    
    //console.log('hasFace 3')
    //const detection = await faceapi.detectSingleFace(input)
    //console.log(detection)

    //console.log('hasFace 4')

    const tensor = await image(input);
    const result = await detect(tensor);
    //console.log("Detected faces:", result.length);

    //console.log('hasFace 5')

    tensor.dispose();

    //console.log('hasFace 6')

    return (result.length > 0)
    //const { Canvas, Image, ImageData } = canvas
    //faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
  }
  catch (e) {
    //console.log('hasFace 7')
    return false
  }
}

/*
async function main(file) {
  console.log("FaceAPI single-process test");

  await faceapi.tf.setBackend("tensorflow");
  await faceapi.tf.enableProdMode();
  await faceapi.tf.ENV.set("DEBUG", false);
  await faceapi.tf.ready();

  console.log(
    `Version: TensorFlow/JS ${faceapi.tf?.version_core} FaceAPI ${
      faceapi.version.faceapi
    } Backend: ${faceapi.tf?.getBackend()}`
  );

  console.log("Loading FaceAPI models");
  const modelPath = path.join(__dirname, modelPathRoot);
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.5,
  });

  const tensor = await image(file);
  const result = await detect(tensor);
  console.log("Detected faces:", result.length);

  tensor.dispose();

  return result;
}
*/
module.exports = hasFace