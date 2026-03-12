import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
    ticker: { type: String, required: true, unique: true }, 
    companyName: { type: String, required: true },          
    sector: { type: String, required: true },               
    currentPrice: { type: Number, required: true },         
    marketCap: { type: Number }, 
    volume: { type: Number },    
    
    // Last update from CSE
    lastUpdate: { type: Date, default: Date.now },

    // Financial Ratios (The 10 ratios requested)
    ratios: {
        eps: Number,           
        peRatio: Number,       
        pbRatio: Number,       
        roe: Number,           
        roa: Number,           // Added ROA as requested in prompt
        debtToEquity: Number,  
        currentRatio: Number,  
        quickRatio: Number,    
        pegRatio: Number,      
        dividendYield: Number, 
        profitMargin: Number   // Added profit margin
    }
}, { timestamps: true });

const Stock = mongoose.model('Stock', stockSchema);
export default Stock;