import apiClient from './apiClient.js';

/**
 * Compare 1–3 CSE companies side-by-side
 * @param {string[]} symbols - e.g. ["JKH.N0000", "COMB.N0000"]
 * @param {number} year - e.g. 2024
 * @param {string} periodType - "ANNUAL" or "QUARTERLY"
 * @param {number|null} quarter - 1–4 (only for QUARTERLY)
 */
export const compareCompanies = async (symbols, year, periodType = 'ANNUAL', quarter = null) => {
  const params = {
    symbols: symbols.join(','),
    year,
    periodType
  };
  if (periodType === 'QUARTERLY' && quarter) {
    params.quarter = quarter;
  }
  const res = await apiClient.get('/compare/companies', { params });
  return res.data;
};
