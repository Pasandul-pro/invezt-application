const axios = require('axios');

const BASE_URL = 'https://www.cse.lk/api';

const fetchCseData = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/tradeSummary`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'application/json',
                'Referer': 'https://www.cse.lk/'
            },
            timeout: 10000
        });
        
        const priceDict = {};
        if (response.data && Array.isArray(response.data)) {
            response.data.forEach(item => {
                const symbol = item.symbol;
                if (symbol) {
                    priceDict[symbol] = {
                        price: parseFloat(item.lastTradedPrice || 0),
                        change: parseFloat(item.change || 0),
                        volume: parseInt(item.volume || 0),
                        open: parseFloat(item.open || 0),
                        high: parseFloat(item.high || 0),
                        low: parseFloat(item.low || 0),
                    };
                }
            });
        }
        return priceDict;
    } catch (error) {
        console.error('Error fetching data from CSE:', error.message);
        return {};
    }
};

exports.getAllStockPrices = async () => {
    return await fetchCseData();
};

exports.getStockPrice = async (symbol) => {
    if (!symbol) return null;
    const prices = await fetchCseData();
    const stockData = prices[symbol];
    return stockData ? stockData.price : null;
};
