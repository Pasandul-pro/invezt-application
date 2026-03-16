import mongoose from 'mongoose';
import Stock from './src/models/Stock.js';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/invezt');
  const stocks = await Stock.find().limit(3);
  console.log(JSON.stringify(stocks, null, 2));
  mongoose.connection.close();
  process.exit(0);
}
run();
