const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock'); // 1. Bring in our Stock Blueprint

// 2. Create the POST route (The "Add Stock" menu item)
router.post('/', async (req, res) => {
    try {
        // req.body contains the raw data (the customer's order) sent to the server
        const newStock = new Stock(req.body); 
        
        // Tell Mongoose to save this data into the MongoDB Cloud Pantry
        const savedStock = await newStock.save(); 
        
        // If successful, send a 201 (Created) success message back!
        res.status(201).json({ 
            message: "Stock added successfully!", 
            data: savedStock 
        });

    } catch (error) {
        // If they missed a required field (like the ticker), send an error
        res.status(400).json({ 
            message: "Failed to add stock", 
            error: error.message 
        });
    }
});

// 3. Create the GET route (The "Read all Stocks" menu item)
router.get('/', async (req, res) => {
    try {
        // .find() tells MongoDB to grab every single stock in the database
        const stocks = await Stock.find(); 
        
        // Send the list of stocks back with a 200 (OK) success message
        res.status(200).json(stocks);
        
    } catch (error) {
        res.status(500).json({ 
            message: "Failed to fetch stocks", 
            error: error.message 
        });
    }
});

// DELETE Route: Remove a stock by its ID
// Notice the path is just '/:id' because this file already handles '/api/stocks'
router.delete('/:id', async (req, res) => {
    try {
        const deletedStock = await Stock.findByIdAndDelete(req.params.id);

        if (!deletedStock) {
            return res.status(404).json({ message: "Stock not found" });
        }

        res.status(200).json({ message: "Stock deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting stock", error: error.message });
    }
});

// UPDATE Route: Edit an existing stock by its ID
router.put('/:id', async (req, res) => {
    try {
        // Find the stock by ID and update it with the new data from the frontend
        const updatedStock = await Stock.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // This tells Mongoose to return the newly updated version
        );

        if (!updatedStock) {
            return res.status(404).json({ message: "Stock not found" });
        }

        res.status(200).json({ message: "Stock updated successfully!", data: updatedStock });
    } catch (error) {
        res.status(500).json({ message: "Error updating stock", error: error.message });
    }
});

// Export the router so the main server can use it
module.exports = router;