const fs = require("fs");
const { google } = require("googleapis");


const CLIENT_ID = process.env.client_id;
const CLIENT_SECRET = process.env.client_secret;
const REDIRECT_URI = process.env.redirect_uris;

const url_stream = "rtmp://a.rtmp.youtube.com/live2";
const url_server = "rtmp://b.rtmp.youtube.com/live2?backup=1";
const stream_key = "tm50-mb04-h74t-9g3h-0gdt";
//const link_stream = url_server + "/" + stream_key;
const link_stream = url_stream + "/" + stream_key;

const initAuth = (google_token) => {
    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    //refresh token auto get access token
    const token = { refresh_token: google_token };
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
};

const uploadVideo = (filePath, fileName, user) => {
    const service = google.youtube("v3");
    const auth = initAuth(user);
    service.videos.insert(
        {
            auth: auth,
            part: "snippet,contentDetails,status",
            resource: {
                // Video title and description
                snippet: {
                    title: fileName,
                    description: "My description",
                },
                // I set to private for tests
                status: {
                    privacyStatus: "public",
                },
            },

            // Create the readable stream to upload the video
            media: {
                body: fs.createReadStream(filePath), // Change here to your real video
            },
        },
        (error, data) => {
            if (error) console.log(error);
            else console.log("https://www.youtube.com/watch?v=" + data.data.id);
        }
    );
};

const streamVideo = () => {
    const service = google.youtube("v3");
    const auth = initAuth();

    service.liveStreams.insert(
        {
            auth: auth,
            part: "snippet,contentDetails,status",
            resource: {
                // Video title and description
                snippet: {
                    title: "My title",
                    description: "My description",
                },
                // I set to private for tests
                status: {
                    privacyStatus: "private",
                },
                cdn: {
                    ingestionType: "rtmp",
                    ingestionInfo: {
                        streamName: stream_key,
                        ingestionAddress: url_stream,
                        backupIngestionAddress: url_server,
                    },
                    resolution: "360p",
                    frameRate: "30fps",
                },
            },

            // Create the readable stream to upload the video
            media: {
                body: fs.createReadStream("video.mp4"), // Change here to your real video
            },
        },
        (error) => {
            if (error) {
                console.log(error);
            }
            console.log("dang stream");
        }
    );
};

module.exports = { uploadVideo, streamVideo };
