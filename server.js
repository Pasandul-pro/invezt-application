// 1. Bring in the tools we installed
const express = require('express');
const cors = require('cors');

// 2. Initialize the Express application (Turn on the Kitchen)
const app = express();

// 3. Set up middle-men (Security and data reading)
app.use(cors());
app.use(express.json()); // Allows our app to read JSON data

// 4. Create our first 'Route' (A menu item the waiter can order)
app.get('/', (req, res) => {
    res.send("Welcome to the Invezt Backend! The Kitchen is officially open.");
});

// 5. Tell the server to listen on a specific port (like assigning a street address)
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running beautifully on port ${PORT}`);
});