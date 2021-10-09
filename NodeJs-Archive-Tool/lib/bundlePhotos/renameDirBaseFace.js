/* global __dirname */

const fs = require('fs')
const path = require('path')

const tf = require('@tensorflow/tfjs-node')
const faceapi = require('@vladmandic/face-api');

const canvas = require('canvas');

const getDirectories = require('./../fileList/getDirectories.js')
const getFilesInDirectory = require('./../fileList/getFilesInDirectory.js')

const exifr = require('exifr')

const renameDirBaseFace = async function (dir) {
  let dirList = await getDirectories(dir)
  
  for (let i = 0; i < dirList.length; i++) {
    let dirpath = dirList[i]
    
    let fileList = await getFilesInDirectory(dirpath)
    
    fileList = fileList.filter(f => (f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.jpg')))
    
    let peopleExisted = false
    for (let j = 0; j < fileList.length; j++) {
      let filepath = fileList[j]
      if (filepath.endsWith('0-preview.png')) {
        continue
      }
      
      let exif = await exifr.parse(filepath)
      //console.log(filepath)
      //console.log(exif)
      if (!exif.Orientation) {
        continue
      }
      
      if (await hasFace(filepath)) {
        peopleExisted = true
        break
      }
    }
    
    if (peopleExisted) {
      // 修改資料夾名稱
      let parentDir = path.dirname(dirpath)
      let dirname = path.basename(dirpath)
      
      let part1 = dirname.slice(0, 9)
      let part2 = dirname.slice(9)
      
      let mark = '[P]'
      
      if (part2.startsWith(mark)) {
        continue
      }
      
      let toDirname = part1 + mark + part2
      let toPath = path.resolve(parentDir, toDirname)
      //console.log(dirpath, toPath)
      fs.renameSync(dirpath, toPath)
    }
  }
}


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

const hasFace = async function (input) {
  try {
    //let input = '/home/pudding/Documents/NetBeansProjects/[nodejs]/NodeJs-Archive-Tool/NodeJs-Archive-Tool/[test/20211009 photo/20211009 a/LINE_1578402778237.jpg'
    //console.log('[gogogo]', input)
    input = fs.readFileSync(input)
    //const detection = await faceapi.detectSingleFace(input)
    //console.log(detection)

    await faceapi.tf.setBackend("tensorflow");
    await faceapi.tf.enableProdMode();
    await faceapi.tf.ENV.set("DEBUG", false);
    await faceapi.tf.ready();

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

    const tensor = await image(input);
    const result = await detect(tensor);
    //console.log("Detected faces:", result.length);

    tensor.dispose();

    return (result.length > 0)
    //const { Canvas, Image, ImageData } = canvas
    //faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
  }
  catch (e) {
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
module.exports = renameDirBaseFace