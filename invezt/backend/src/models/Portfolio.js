import mongoose from "mongoose";

const portfolioHoldingSchema = new mongoose.Schema({
  companyTicker: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  shares: {
    type: Number,
    required: true,
    min: 0,
  },
  averageCost: {
    type: Number,
    required: true,
    min: 0,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
});

const portfolioValueHistorySchema = new mongoose.Schema(
  {
    recordedAt: {
      type: Date,
      required: true,
      index: true,
    },
    totalValue: {
      type: Number,
      required: true,
      min: 0,
    },
    totalInvestment: {
      type: Number,
      required: true,
      min: 0,
    },
    totalGainLoss: {
      type: Number,
      required: true,
    },
    totalGainLossPercent: {
      type: Number,
      required: true,
    },
    priceSource: {
      type: String,
      default: "cse",
    },
    priceStale: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
);

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: "My Portfolio",
    },
    holdings: [portfolioHoldingSchema],
    valueHistory: {
      type: [portfolioValueHistorySchema],
      default: [],
    },
    historyBackfilledAt: {
      type: Date,
      default: null,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const Portfolio = mongoose.model("Portfolio", portfolioSchema);
export default Portfolio;
