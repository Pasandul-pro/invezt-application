const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  sector: { type: String },
  marketCap: { type: Number }
});

module.exports = mongoose.model('Stock', stockSchema);