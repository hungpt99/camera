const canvas = require("canvas");
const db = require("../config/db");
const fs = require("fs");
const ReportModel = require('../models/ReportModel');
const cv = require('opencv4nodejs');
const faceapi = require("face-api.js");
require('@tensorflow/tfjs-node')

const { Canvas, Image, ImageData } = canvas;

//danh sach nguoi quen
let descriptions = []
//danh sach so sanh
let listDetect = [];
let camera;
let url;
let base64;

module.exports = async (input, callback) => {
    camera = input;
    url = camera.camera_link;

    await loadEnvironment();
    await loadImage()
    captureFrame();
    setInterval(() => {
        detect();
    }, 200);
    saveImage()
}
const loadEnvironment = async () => {
    faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

    db.connect();

    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromDisk("./src/weights"),
        faceapi.nets.faceRecognitionNet.loadFromDisk("./src/weights"),
        faceapi.nets.faceLandmark68Net.loadFromDisk("./src/weights")
    ])
}
const loadImage = async () => {
    //khoi tao danh sach nguoi quen

    const dirPath = process.env.HOME_PATH + '\\src\\public\\face\\' + camera._id;
    let listFile = fs.readdirSync(dirPath)

    listFile = listFile.map((value, index) => {
        return canvas.loadImage(dirPath + '\\' + value)
    })
    listFile = await Promise.all(listFile);

    descriptions = listFile.map((img, index) => {
        return faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
    })
    descriptions = await Promise.all(descriptions);

    listDetect = descriptions;
}
const captureFrame = async () => {
    cap = new cv.VideoCapture(url)

    setInterval(() => {
        try {
            const frame = cap.read()
            base64 = 'data:image/png;base64,' + cv.imencode('.jpg', frame).toString('base64');
        } catch (err) {
            captureFrame();
            return;
        }
    }, 100);
}
const detect = async () => {
    const img = new Image()
    img.src = base64;

    const resultDetect = await faceapi
        .detectAllFaces(img)
        .withFaceLandmarks()
        .withFaceDescriptors()

    if (!resultDetect.length) {
        console.log('khong co nguoi nao')
        return;
    }

    const faceMatcher = new faceapi.FaceMatcher(resultDetect);

    let bestMatch = 'unknown';

    listDetect.forEach(face => {
        if (faceMatcher.findBestMatch(face.descriptor).label !== "unknown")
            bestMatch = '';
    })

    if (bestMatch === 'unknown') {
        listDetect = [...listDetect, ...resultDetect]
        createReport(base64)
    } else {
        console.log('co nguoi quen')
    }
}

const createReport = async (base64) => {
    console.log('co nguoi la')
    const time = new Date().getTime();
    let report = await new ReportModel({ camera: camera._id, report_time: time }).save();
    let base64Data = base64.replace(/^data:image\/png;base64,/, "");
    let path = `${process.env.HOME_PATH}\\src\\public\\report\\${report._id}.png`
    fs.writeFile(
        path,
        base64Data,
        'base64',
        (err) => { console.log(err) }
    )
}
const saveImage = () => {
    setInterval(() => {
        let base64Data = base64.replace(/^data:image\/png;base64,/, "");
        let path = `${process.env.HOME_PATH}\\src\\public\\current\\${camera._id}.png`
        fs.writeFile(
            path,
            base64Data,
            'base64',
            (err) => { console.log(err) }
        )
    }, 60000);
}