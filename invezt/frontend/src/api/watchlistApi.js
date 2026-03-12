import apiClient from './apiClient.js';

/** Get user's watchlist with live CSE prices */
export const getWatchlist = async () => {
  const res = await apiClient.get('/watchlist');
  return res.data;
};

/**
 * Add a stock to watchlist
 * @param {string} symbol - e.g. "JKH.N0000"
 * @param {string} companyName - e.g. "John Keells Holdings"
 */
export const addToWatchlist = async (symbol, companyName = '') => {
  const res = await apiClient.post('/watchlist', { symbol, companyName });
  return res.data;
};

/**
 * Remove a stock from watchlist
 * @param {string} symbol - e.g. "JKH.N0000"
 */
export const removeFromWatchlist = async (symbol) => {
  const res = await apiClient.delete(`/watchlist/${symbol}`);
  return res.data;
};
