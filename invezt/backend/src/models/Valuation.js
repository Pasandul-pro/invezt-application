import mongoose from 'mongoose';

const valuationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    companyName: String,
    modelType: {
        type: String,
        enum: ['dcf', 'capm', 'gordon', 'comparable'],
        required: true
    },
    inputData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    results: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Valuation = mongoose.model('Valuation', valuationSchema);
export default Valuation;