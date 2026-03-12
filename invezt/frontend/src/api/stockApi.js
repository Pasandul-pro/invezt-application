import apiClient from './apiClient.js';

/**
 * Get the full market snapshot: ASPI, S&P SL20, top gainers, losers, most active
 */
export const getMarketSnapshot = async () => {
  const res = await apiClient.get('/market/highlights');
  return res.data;
};

/**
 * Get real-time info for a single stock symbol from CSE
 * @param {string} symbol - e.g. "JKH.N0000"
 */
export const getStockInfo = async (symbol) => {
  const res = await apiClient.get(`/stocks/realtime/${symbol}`);
  return res.data;
};

/**
 * Get today's full trade summary list from CSE
 */
export const getTradeSummary = async () => {
  const res = await apiClient.get('/stocks/market/snapshot');
  return res.data;
};

/**
 * Get chart data for a stock over a period
 * @param {string} symbol
 * @param {string} period - "1W", "1M", "3M", "6M", "1Y"
 */
export const getChartData = async (symbol, period = '1M') => {
  const res = await apiClient.get(`/stocks/${symbol}/chart`, { params: { period } });
  return res.data;
};
