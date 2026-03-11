import mongoose from 'mongoose';

const watchlistItemSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  companyName: {
    type: String,
    trim: true,
    default: ''
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const watchlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,   // One watchlist per user
    index: true
  },
  stocks: [watchlistItemSchema]
}, {
  timestamps: true
});

const Watchlist = mongoose.model('Watchlist', watchlistSchema);
export default Watchlist;
