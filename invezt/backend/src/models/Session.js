import mongoose from 'mongoose';

const sessionFile = new mongoose.Schema(
    {
        firebaseUid: {
            type: String,
            required: true,
            index: true,

        },

        token: {
            type: String,
            required: true,
        },
        
        platform: {
            type: String,
            default: 'web',

        },
        ipAddress: {
            type: String,
            default: null,

        },
        deviceInfo: {
            type: String,
            default: null,

        },
        validUntil: {
            type: Date,
            required: true,

        },
        isActive: {
            type: Boolean,
            default: true,

        },
    },
    {timestamps: true}
);

sessionFile.index({validUntil: 1}, {expireAfterSeconds: 0});

const Session = mongoose.model('Session', sessionFile);
export default Session;


