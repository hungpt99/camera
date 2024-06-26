const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Event = require('../events/camera.event').eventBus;

const CameraSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "users" },
        location: { type: Schema.Types.ObjectId, ref: "locations" },
        camera_name: { type: String },
        camera_link: { type: String },
        camera_location: { type: Array },
        camera_public: { type: Boolean },
        google_token: { type: String },
        working_time: { type: Array },
        detect_zone: { type: Array }
    },
    { timestamps: true }
);
CameraSchema.post('save', function (next) {
    Event.emit('NEW_CAMERA', this);
});

const CameraModel = mongoose.model("cameras", CameraSchema);

module.exports = CameraModel;
