import apiClient from './apiClient.js';

/**
 * Calculate DCF (Discounted Cash Flow) valuation
 * @param {{ symbol, companyName, cashFlows, discountRate, perpetualGrowthRate, sharesOutstanding, currentPrice }} data
 */
export const calculateDCF = async (data) => {
  const res = await apiClient.post('/valuation/dcf', data);
  return res.data;
};

/**
 * Calculate CAPM (Capital Asset Pricing Model)
 * @param {{ symbol, companyName, riskFreeRate, beta, marketRiskPremium }} data
 */
export const calculateCAPM = async (data) => {
  const res = await apiClient.post('/valuation/capm', data);
  return res.data;
};

/** Get user's valuation history (last 20) */
export const getValuationHistory = async () => {
  const res = await apiClient.get('/valuation/history');
  return res.data;
};
