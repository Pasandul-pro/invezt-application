import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import realTimeStockService from './src/services/realTimeStockService.js';

async function testFetch() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('DB connected');
    const result = await realTimeStockService._fetchOfficialTradeSummary();
    console.log('Success! Fetched quotes:', result.quotes.length);
    if (result.quotes.length > 0) {
      console.log('Sample:', result.quotes[0]);
    }
  } catch (error) {
    console.error('Failed:', error.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

testFetch();
