const Watchlist = require('../models/Watchlist');
const Transaction = require('../models/Transaction');


// ADD TO WATCHLIST
exports.addToWatchlist = async (req, res) => {
    try {
        const { userId, symbol } = req.body;
        // Find the user's watchlist or create a new one if it doesn't exist
        let watchlist = await Watchlist.findOne({ userId });
        
        if (!watchlist) {
            watchlist = new Watchlist({ userId, stocks: [{ symbol }] });
        } else {
            // Check if stock is already there to avoid duplicates
            if (!watchlist.stocks.some(s => s.symbol === symbol)) {
                watchlist.stocks.push({ symbol });
            }
        }
        await watchlist.save();
        res.status(200).json(watchlist);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// RECORD A TRANSACTION (Buying/Selling)
exports.addTransaction = async (req, res) => {
    try {
        const { userId, symbol, type, quantity, pricePerShare } = req.body;
        const totalValue = quantity * pricePerShare;

        const newTransaction = new Transaction({
            userId, symbol, type, quantity, pricePerShare, totalValue
        });

        await newTransaction.save();
        res.status(201).json(newTransaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// --- WATCHLIST CRUD ---

// VIEW WATCHLIST (Read)
exports.getWatchlist = async (req, res) => {
    try {
        // We find the watchlist belonging to the logged-in user
        const watchlist = await Watchlist.findOne({ userId: req.params.userId });
        if (!watchlist) return res.json({ stocks: [] });
        res.status(200).json(watchlist);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// REMOVE FROM WATCHLIST (Delete)
exports.removeFromWatchlist = async (req, res) => {
    try {
        const { userId, symbol } = req.body;
        const watchlist = await Watchlist.findOne({ userId });
        if (watchlist) {
            // Filter out the stock symbol we want to remove
            watchlist.stocks = watchlist.stocks.filter(s => s.symbol !== symbol);
            await watchlist.save();
        }
        res.status(200).json(watchlist);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- TRANSACTION / PORTFOLIO CRUD ---

// VIEW TRANSACTION HISTORY (Read)
exports.getTransactionHistory = async (req, res) => {
    try {
        // Fetch all trades for this user, newest first
        const history = await Transaction.find({ userId: req.params.userId }).sort({ date: -1 });
        res.status(200).json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CALCULATE PORTFOLIO SUMMARY (Read)
// This logic helps show the "Total Value" on the portfolio.html page
exports.getPortfolioSummary = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.params.userId });
        // Simple logic: Group by symbol to see current holdings
        let summary = {};
        transactions.forEach(t => {
            if (!summary[t.symbol]) summary[t.symbol] = 0;
            summary[t.symbol] += (t.type === 'BUY' ? t.quantity : -t.quantity);
        });
        res.status(200).json(summary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};