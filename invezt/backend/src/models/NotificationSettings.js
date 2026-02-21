const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  pushNotifications: {
    priceAlerts: { type: Boolean, default: true },
    earningsReports: { type: Boolean, default: true },
    quarterlyReports: { type: Boolean, default: false },
    marketNews: { type: Boolean, default: true }
  },
  emailNotifications: {
    priceAlerts: { type: Boolean, default: false },
    earningsReports: { type: Boolean, default: true },
    quarterlyReports: { type: Boolean, default: true },
    marketNews: { type: Boolean, default: false }
  },
  watchlistAlerts: [{
    ticker: String,
    companyName: String,
    alertOnPriceChange: { type: Boolean, default: true },
    priceChangeThreshold: { type: Number, default: 5 },
    alertOnNews: { type: Boolean, default: true },
    alertOnEarnings: { type: Boolean, default: true }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('NotificationSettings', notificationSettingsSchema);