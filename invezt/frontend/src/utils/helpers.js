// src/utils/helpers.js

/**
 * Format currency in LKR
 * @param {number} amount - Amount to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, decimals = 2) => {
  if (isNaN(amount)) return 'LKR 0.00';
  return `LKR ${Number(amount).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  if (isNaN(value)) return '0.00%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${Number(value).toFixed(decimals)}%`;
};

/**
 * Format large numbers with suffixes (K, M, B)
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  if (isNaN(num)) return '0';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  }
  if (absNum >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  }
  if (absNum >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  return num.toString();
};

/**
 * Calculate percentage change between two values
 * @param {number} oldValue - Original value
 * @param {number} newValue - New value
 * @returns {number} Percentage change
 */
export const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Calculate gain/loss for portfolio item
 * @param {number} shares - Number of shares
 * @param {number} avgCost - Average cost per share
 * @param {number} currentPrice - Current price per share
 * @returns {object} Gain/loss information
 */
export const calculateGainLoss = (shares, avgCost, currentPrice) => {
  const totalCost = shares * avgCost;
  const currentValue = shares * currentPrice;
  const gainLoss = currentValue - totalCost;
  const gainLossPercent = ((gainLoss / totalCost) * 100).toFixed(2);
  
  return {
    totalCost,
    currentValue,
    gainLoss,
    gainLossPercent: parseFloat(gainLossPercent),
    isProfit: gainLoss >= 0
  };
};

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'full')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const options = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  };
  
  return dateObj.toLocaleDateString('en-US', options[format] || options.short);
};

/**
 * Validate stock ticker format
 * @param {string} ticker - Ticker symbol to validate
 * @returns {boolean} True if valid ticker format
 */
export const isValidTicker = (ticker) => {
  // Sri Lankan stock format: XXXX.N0000
  const tickerRegex = /^[A-Z]{2,4}\.N\d{4}$/;
  return tickerRegex.test(ticker);
};

/**
 * Calculate P/E Ratio
 * @param {number} price - Stock price
 * @param {number} eps - Earnings per share
 * @returns {number} P/E ratio
 */
export const calculatePERatio = (price, eps) => {
  if (eps === 0) return 0;
  return (price / eps).toFixed(2);
};

/**
 * Calculate PEG Ratio
 * @param {number} peRatio - P/E ratio
 * @param {number} growthRate - Earnings growth rate
 * @returns {number} PEG ratio
 */
export const calculatePEGRatio = (peRatio, growthRate) => {
  if (growthRate === 0) return 0;
  return (peRatio / growthRate).toFixed(2);
};

/**
 * Calculate ROE (Return on Equity)
 * @param {number} netIncome - Net income
 * @param {number} shareholderEquity - Shareholder equity
 * @returns {number} ROE percentage
 */
export const calculateROE = (netIncome, shareholderEquity) => {
  if (shareholderEquity === 0) return 0;
  return ((netIncome / shareholderEquity) * 100).toFixed(2);
};

/**
 * Calculate ROA (Return on Assets)
 * @param {number} netIncome - Net income
 * @param {number} totalAssets - Total assets
 * @returns {number} ROA percentage
 */
export const calculateROA = (netIncome, totalAssets) => {
  if (totalAssets === 0) return 0;
  return ((netIncome / totalAssets) * 100).toFixed(2);
};

/**
 * Calculate Debt-to-Equity Ratio
 * @param {number} totalDebt - Total debt
 * @param {number} totalEquity - Total equity
 * @returns {number} D/E ratio
 */
export const calculateDebtToEquity = (totalDebt, totalEquity) => {
  if (totalEquity === 0) return 0;
  return (totalDebt / totalEquity).toFixed(2);
};

/**
 * Calculate Current Ratio
 * @param {number} currentAssets - Current assets
 * @param {number} currentLiabilities - Current liabilities
 * @returns {number} Current ratio
 */
export const calculateCurrentRatio = (currentAssets, currentLiabilities) => {
  if (currentLiabilities === 0) return 0;
  return (currentAssets / currentLiabilities).toFixed(2);
};

/**
 * Calculate Quick Ratio (Acid Test)
 * @param {number} currentAssets - Current assets
 * @param {number} inventory - Inventory value
 * @param {number} currentLiabilities - Current liabilities
 * @returns {number} Quick ratio
 */
export const calculateQuickRatio = (currentAssets, inventory, currentLiabilities) => {
  if (currentLiabilities === 0) return 0;
  return ((currentAssets - inventory) / currentLiabilities).toFixed(2);
};

/**
 * Calculate Dividend Yield
 * @param {number} annualDividend - Annual dividend per share
 * @param {number} price - Current stock price
 * @returns {number} Dividend yield percentage
 */
export const calculateDividendYield = (annualDividend, price) => {
  if (price === 0) return 0;
  return ((annualDividend / price) * 100).toFixed(2);
};

/**
 * Calculate EPS (Earnings Per Share)
 * @param {number} netIncome - Net income
 * @param {number} dividends - Preferred dividends
 * @param {number} shares - Outstanding shares
 * @returns {number} EPS
 */
export const calculateEPS = (netIncome, dividends, shares) => {
  if (shares === 0) return 0;
  return ((netIncome - dividends) / shares).toFixed(2);
};

/**
 * Classify valuation based on P/E ratio
 * @param {number} peRatio - P/E ratio
 * @returns {string} Valuation classification
 */
export const classifyValuation = (peRatio) => {
  if (peRatio < 0) return 'Negative Earnings';
  if (peRatio < 10) return 'Undervalued';
  if (peRatio < 20) return 'Fairly Valued';
  if (peRatio < 30) return 'Expensive';
  return 'Overvalued';
};

/**
 * Get color class based on value (positive/negative)
 * @param {number} value - Value to check
 * @returns {string} Tailwind color class
 */
export const getColorClass = (value) => {
  return value >= 0 ? 'text-green-600' : 'text-red-600';
};

/**
 * Get background color class based on value
 * @param {number} value - Value to check
 * @returns {string} Tailwind background color class
 */
export const getBgColorClass = (value) => {
  return value >= 0 ? 'bg-green-50' : 'bg-red-50';
};

/**
 * Get border color class based on value
 * @param {number} value - Value to check
 * @returns {string} Tailwind border color class
 */
export const getBorderColorClass = (value) => {
  return value >= 0 ? 'border-green-500' : 'border-red-500';
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Sort array of objects by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export const sortByKey = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });
};

/**
 * Filter companies by search term
 * @param {Array} companies - Array of companies
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered companies
 */
export const filterCompanies = (companies, searchTerm) => {
  if (!searchTerm) return companies;
  
  const term = searchTerm.toLowerCase();
  return companies.filter(company => 
    company.name.toLowerCase().includes(term) ||
    company.ticker.toLowerCase().includes(term) ||
    company.sector.toLowerCase().includes(term)
  );
};

/**
 * Generate random color for charts
 * @returns {string} Random RGB color
 */
export const getRandomColor = () => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Calculate compound annual growth rate (CAGR)
 * @param {number} beginningValue - Beginning value
 * @param {number} endingValue - Ending value
 * @param {number} years - Number of years
 * @returns {number} CAGR percentage
 */
export const calculateCAGR = (beginningValue, endingValue, years) => {
  if (beginningValue === 0 || years === 0) return 0;
  return ((Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100).toFixed(2);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate chart data for portfolio growth
 * @param {Array} data - Portfolio data points
 * @returns {object} Chart.js formatted data
 */
export const generateChartData = (data) => {
  return {
    labels: data.map(item => item.date),
    datasets: [{
      label: 'Portfolio Value',
      data: data.map(item => item.value),
      borderColor: '#1e3a8a',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: true,
      tension: 0.4,
    }]
  };
};

/**
 * Calculate portfolio total value
 * @param {Array} holdings - Array of portfolio holdings
 * @returns {number} Total portfolio value
 */
export const calculatePortfolioValue = (holdings) => {
  return holdings.reduce((total, holding) => {
    return total + (holding.shares * holding.currentPrice);
  }, 0);
};

/**
 * Calculate portfolio total gain/loss
 * @param {Array} holdings - Array of portfolio holdings
 * @returns {object} Total gain/loss information
 */
export const calculatePortfolioGainLoss = (holdings) => {
  const totalCost = holdings.reduce((sum, h) => sum + (h.shares * h.avgCost), 0);
  const currentValue = holdings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0);
  const gainLoss = currentValue - totalCost;
  const gainLossPercent = totalCost > 0 ? ((gainLoss / totalCost) * 100).toFixed(2) : 0;
  
  return {
    totalCost,
    currentValue,
    gainLoss,
    gainLossPercent: parseFloat(gainLossPercent),
    isProfit: gainLoss >= 0
  };
};

/**
 * Get time ago string from date
 * @param {Date|string} date - Date to convert
 * @returns {string} Time ago string
 */
export const getTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  
  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  if (diffHr > 0) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  return 'Just now';
};

/**
 * Export data to CSV
 * @param {Array} data - Data to export
 * @param {string} filename - File name
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => row[h]).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

// Export all functions as default
export default {
  formatCurrency,
  formatPercentage,
  formatNumber,
  calculatePercentageChange,
  calculateGainLoss,
  formatDate,
  isValidTicker,
  calculatePERatio,
  calculatePEGRatio,
  calculateROE,
  calculateROA,
  calculateDebtToEquity,
  calculateCurrentRatio,
  calculateQuickRatio,
  calculateDividendYield,
  calculateEPS,
  classifyValuation,
  getColorClass,
  getBgColorClass,
  getBorderColorClass,
  truncateText,
  debounce,
  sortByKey,
  filterCompanies,
  getRandomColor,
  calculateCAGR,
  isValidEmail,
  generateChartData,
  calculatePortfolioValue,
  calculatePortfolioGainLoss,
  getTimeAgo,
  exportToCSV
};