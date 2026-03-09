import Watchlist from '../models/Watchlist.js';

export const addToWatchlist = async (req, res) => {
    const { userId, symbol } = req.body;
    let watchlist = await Watchlist.findOne({ userId });

    if (!watchlist) {
        watchlist = new Watchlist({ userId, stocks: [{ symbol }] });
    } else {
        watchlist.stocks.push({ symbol });
    }
    await watchlist.save();
    res.json(watchlist);
};

export default { addToWatchlist };