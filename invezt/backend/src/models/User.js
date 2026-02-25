import mongoose from 'mongoose';

const userFile = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 100,

        },
        email: {
            type: String,
            trim: true,
            required: true,
            maxlength: 255,
            unique: true,
            lowercase: true,
            match: [/.+\@.+\..+/, "please enter a valid email"],
        
        },
        firebaseUid: {
            type: String,
            required: true, 
            unique: true,
        },
        photoUrl: {
            type: String,
            maxlength: 1024,
            default: null,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            default: 'user',
            enum: ['user', 'admin'],
        },

        notificationSettings: {
            priceAlertPush : {type: Boolean, default: true},
            priceAlertsEmail : {type: Boolean, default: true},
            earningsReportsPush : {type: Boolean, default: true},
            earningsReportsEmail : {type: Boolean, default: true},
            quarterlyReportsPush : {type: Boolean, default: true},
            quarterlyReportsEmail : {type: Boolean, default: true},
            marketNewsPush : {type: Boolean, default: true},
            marketNewsEmail: {type: Boolean, default: false},

        },

        portfolio: [{type: String}],
        watchlist: [{type: String}],

        status: {
            type: String,
            enum: ['active' , 'suspended' , 'deleted'],
            default: 'active',

        },
    },
    {timestamps: true}
);

userFile.index({ firebaseUid: 1});
userFile.index({ watchlist: 1});
userFile.index({ portfolio: 1});
userFile.index({ status: 1, role: 1});

const User = mongoose.model('User', userFile);
export default User;
