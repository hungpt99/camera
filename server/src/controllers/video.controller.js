const VideoModel = require("../models/video.model");

exports.getVideo = async (args) => {
    return await VideoModel.findOne(args);
}
exports.getVideos = async (args) => {
    return await VideoModel.find(args);
}
exports.createVideo = async (args) => {
    const newVideo = new VideoModel(args);
    return await newVideo.save();
}
exports.deleteVideo = async (args) => {
    return await VideoModel.findByIdAndDelete(args._id);
}
exports.deleteVideoByCamera = async (args) => {
    const query = { camera: args._id };
    return await VideoModel.deleteMany(query);
}