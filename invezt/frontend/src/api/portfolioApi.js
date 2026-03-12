import apiClient from './apiClient.js';

/** Get all portfolios for the logged-in user (with live CSE prices) */
export const getPortfolios = async () => {
  const res = await apiClient.get('/portfolio');
  return res.data;
};

/** Get a single portfolio by ID */
export const getPortfolioById = async (id) => {
  const res = await apiClient.get(`/portfolio/${id}`);
  return res.data;
};

/** Create a new portfolio */
export const createPortfolio = async (name) => {
  const res = await apiClient.post('/portfolio', { name });
  return res.data;
};

/** Update portfolio name */
export const updatePortfolio = async (id, name) => {
  const res = await apiClient.put(`/portfolio/${id}`, { name });
  return res.data;
};

/** Delete a portfolio */
export const deletePortfolio = async (id) => {
  const res = await apiClient.delete(`/portfolio/${id}`);
  return res.data;
};

/**
 * Add or update a holding in a portfolio
 * @param {string} portfolioId
 * @param {{ companyTicker, companyName, shares, averageCost, purchaseDate }} data
 */
export const addHolding = async (portfolioId, data) => {
  const res = await apiClient.post(`/portfolio/${portfolioId}/holdings`, data);
  return res.data;
};

/** Update shares/averageCost of a holding */
export const updateHolding = async (portfolioId, ticker, data) => {
  const res = await apiClient.put(`/portfolio/${portfolioId}/holdings/${ticker}`, data);
  return res.data;
};

/** Remove a holding from a portfolio */
export const removeHolding = async (portfolioId, ticker) => {
  const res = await apiClient.delete(`/portfolio/${portfolioId}/holdings/${ticker}`);
  return res.data;
};

/** Get performance data for a portfolio */
export const getPerformance = async (portfolioId) => {
  const res = await apiClient.get(`/portfolio/${portfolioId}/performance`);
  return res.data;
};
