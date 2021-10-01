const { sendRPCMessage } = require('../../module/rabbitmq.modules')

const resolvers = {
    Query: {
        camera: async (parent, args, { channel }) => JSON.parse(await sendRPCMessage(channel, args, 'GET_CAMERA')),
        cameras: async (parent, args, { channel }) => JSON.parse(await sendRPCMessage(channel, args, 'GET_CAMERAS')),
        user: async (parent, args, { channel, req }) => JSON.parse(await sendRPCMessage(channel, { ...args, user: req?.user }, 'GET_USER')),
        users: async (parent, args, { channel }) => JSON.parse(await sendRPCMessage(channel, args, 'GET_USERS')),
        video: async (parent, args, { channel }) => JSON.parse(await sendRPCMessage(channel, args, 'GET_VIDEO')),
        videos: async (parent, args, { channel }) => JSON.parse(await sendRPCMessage(channel, args, 'GET_VIDEOS')),
        report: async (parent, args, { channel }) => JSON.parse(await sendRPCMessage(channel, args, 'GET_REPORT')),
        reports: async (parent, args, { channel }) => JSON.parse(await sendRPCMessage(channel, args, 'GET_REPORTS')),
    },
    Camera: {
        videos: async (parent, args, { channel }) => JSON.parse(await sendRPCMessage(channel, { camera: parent._id }, 'GET_VIDEOS')),
        reports: async (parent, args, { channel }) => JSON.parse(await sendRPCMessage(channel, { camera: parent._id }, 'GET_REPORTS')),
    },
    User: {
        cameras: async (parent, args, { channel }) => JSON.parse(await sendRPCMessage(channel, { user: parent._id }, 'GET_CAMERAS'))
    },
    Video: {
        camera: async (parent, args, { channel }) => JSON.parse(await sendRPCMessage(channel, { _id: parent.camera }, 'GET_CAMERA'))
    },
    Report: {
        camera: async (parent, args, { channel }) => JSON.parse(await sendRPCMessage(channel, { _id: parent.camera }, 'GET_CAMERA'))
    },
    Mutation: {
        createCamera: async (parent, args, { channel, req }) => JSON.parse(await sendRPCMessage(channel, { ...args, user: req?.user }, 'CREATE_CAMERA')),
        updateCamera: async (parent, args, { channel, req }) => JSON.parse(await sendRPCMessage(channel, { ...args, user: req?.user }, 'UPDATE_CAMERA')),
        deleteCamera: async (parent, args, { channel, req }) => JSON.parse(await sendRPCMessage(channel, { ...args, user: req?.user }, 'DELETE_CAMERA')),
        signin: async (parent, args, { channel, res }) => {
            const user = JSON.parse(await sendRPCMessage(channel, args, 'SIGNIN'))
            res.cookie('access_token', user.cookie, {
                maxAge: 365 * 24 * 60 * 60 * 100,
                httpOnly: true,
                //secure: true;
            })
            return user;
        },
        signup: async (parent, args, { channel, res }) => {
            const user = JSON.parse(await sendRPCMessage(channel, args, 'SIGNUP'))
            res.cookie('access_token', user.cookie, {
                maxAge: 365 * 24 * 60 * 60 * 100,
                httpOnly: true,
                //secure: true;
            })
            return user;
        },
    }
}

module.exports = resolvers