import User from '../models/User.js';

// @route    POST api/user/watchlist
// @desc     Add stock to watchlist
export const addToWatchlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.watchlist.push(req.body); // req.body should have {symbol, companyName}
        await user.save();
        res.json(user.watchlist);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @route    POST api/user/transaction
// @desc     Record a buy/sell transaction
export const addTransaction = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.transactions.push(req.body); // {symbol, type, quantity, price}
        await user.save();
        res.json(user.transactions);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

export default { addToWatchlist, addTransaction };