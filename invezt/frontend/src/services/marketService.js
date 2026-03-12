import { getMarketSnapshot } from '../api/stockApi.js';

/**
 * Fetch the CSE market snapshot (ASPI, S&P SL20, gainers, losers, most active)
 */
export const getMarketData = () => getMarketSnapshot();

/**
 * Get real-time info for a specific stock symbol
 * @param {string} symbol - e.g. "JKH.N0000"
 */
export const getStock = (symbol) => {
  const { getStockInfo } = require('../api/stockApi.js');
  return getStockInfo(symbol);
};