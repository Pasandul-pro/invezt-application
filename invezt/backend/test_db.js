import mongoose from 'mongoose';
import Stock from './src/models/Stock.js';

async function run() {
  // Try the exact URI from .env
  await mongoose.connect('mongodb+srv://sdgpproject86_db_user:hack20400@cluster0.vot2z9v.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0');

  const stocks = await Stock.find();
  console.log("Total stocks:", stocks.length);
  if (stocks.length > 0) {
    console.log(JSON.stringify(stocks[0], null, 2));
  }
  
  mongoose.connection.close();
  process.exit(0);
}
run();
