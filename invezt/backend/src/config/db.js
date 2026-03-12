// config/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // This opens the .env secret vault

const connectDB = async () => {
    try {
        // We add { family: 4 } to force Node.js to use the normal IPv4 internet road!
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            family: 4 
        });
        console.log(`Success! MongoDB Connected to: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Uh oh! Database connection failed: ${error.message}`);
        process.exit(1); // Stop the kitchen if we can't open the pantry
    }
};

module.exports = connectDB;