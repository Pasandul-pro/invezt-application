import mongoose from 'mongoose';

const authFile = new mongoose.Schema(
    {
    firebaseUid: {
        type: String,
        required: true,
        index: true,
        unique: true,

    },
    provider:{
        type: String,
        enum: ['firebase', 'google', 'github'],
        default: 'firebase',

    },
    loginMethod: {
        type: String,
        default:'password',

    },
    lastAccess: {
        type: Date,
        default: Date.now,
        
    },
    },
    { timestamps: true }
);

const Authentication = mongoose.model('Authentication', authFile);
export default Authentication;

