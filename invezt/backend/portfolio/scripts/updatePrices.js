/**
 * Script to update all portfolio prices
 * Run this every hour using cron or node-cron
 */
const mongoose = require('mongoose');
const Portfolio = require('../models/Portfolio');
require('dotenv').config();

const connectDB = require('../../src/config/db');

async function updateAllPrices() {
    console.log('🕐 Starting price update at', new Date().toISOString());
    
    try {
        // Connect to MongoDB using the same method as the main backend
        await connectDB();
        
        // Update all portfolios
        const result = await Portfolio.updateAllPrices();
        
        console.log('✅ Update completed:');
        console.log(`   Updated: ${result.updated}`);
        console.log(`   Failed: ${result.failed}`);
        console.log(`   Total: ${result.total}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
}

// Run if called directly
if (require.main === module) {
    updateAllPrices();
}

module.exports = updateAllPrices;