import mongoose from 'mongoose';

// ============================================================================
// STOCK DATABASE SCHEMA (NOW WITH PORTFOLIO TRACKING)
// ============================================================================

const stockSchema = new mongoose.Schema({
    // Core Company Data
    ticker: { type: String, required: true, unique: true }, 
    companyName: { type: String, required: true },          
    sector: { type: String, required: true },               
    currentPrice: { type: Number, required: true },         

    // Market Metrics
    marketCap: { type: Number }, 
    volume: { type: Number },    

    // --- NEW: PORTFOLIO HOLDINGS ---
    holdings: {
        quantity: { type: Number, default: 0 },
        avgCost: { type: Number, default: 0 }
    },

    // Financial Ratios (All 10 from your valuation model)
    ratios: {
        eps: Number,           
        peRatio: Number,       
        pbRatio: Number,       
        roe: Number,           
        dividendYield: Number, 
        currentRatio: Number,  
        quickRatio: Number,    
        pegRatio: Number,      
        beta: Number,          
        earningsYield: Number  
    },
    // Sector news
    news: [{
        headline: String,
        summary: String,
        source: String,
        url: String,
        datetime: Date
    }]
});

export default mongoose.model('Stock', stockSchema);