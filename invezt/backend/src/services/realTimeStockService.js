const axios = require('axios');
const StockPrice = require('../models/stockPriceModel');

class RealTimeStockService {
  constructor() {
    this.baseURL = 'https://www.cse.lk/api/';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });
  }

  /**
   * Get real-time stock information by symbol
   * @param {string} symbol - Stock symbol (e.g., 'JKH.N0000')
   */
  async getStockInfo(symbol) {
    try {
      const params = new URLSearchParams();
      params.append('symbol', symbol);

      const response = await this.client.post('companyInfoSummery', params);
      
      const data = response.data;
      
      return {
        symbol: data.reqSymbolInfo.symbol,
        name: data.reqSymbolInfo.name,
        lastTradedPrice: data.reqSymbolInfo.lastTradedPrice,
        change: data.reqSymbolInfo.change,
        changePercentage: data.reqSymbolInfo.changePercentage,
        marketCap: data.reqSymbolInfo.marketCap,
        beta: data.reqSymbolBetaInfo?.betaValueSPSL,
        logo: data.reqLogo ? `https://www.cse.lk/${data.reqLogo.path}` : null
      };
    } catch (error) {
      console.error(`Error fetching stock info for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get today's share price data
   */
  async getTodaySharePrice() {
    try {
      const response = await this.client.post('todaySharePrice');
      return response.data;
    } catch (error) {
      console.error('Error fetching today\'s share prices:', error.message);
      throw error;
    }
  }

  /**
   * Get top gainers
   */
  async getTopGainers() {
    try {
      const response = await this.client.post('topGainers');
      return response.data;
    } catch (error) {
      console.error('Error fetching top gainers:', error.message);
      throw error;
    }
  }

  /**
   * Get top losers
   */
  async getTopLosers() {
    try {
      const response = await this.client.post('topLooses');
      return response.data;
    } catch (error) {
      console.error('Error fetching top losers:', error.message);
      throw error;
    }
  }

  /**
   * Get most active trades by volume
   */
  async getMostActive() {
    try {
      const response = await this.client.post('mostActiveTrades');
      return response.data;
    } catch (error) {
      console.error('Error fetching most active trades:', error.message);
      throw error;
    }
  }

  /**
   * Get market summary (ASPI, S&P20 indices)
   */
  async getMarketSummary() {
    try {
      const response = await this.client.post('marketSummery');
      return response.data;
    } catch (error) {
      console.error('Error fetching market summary:', error.message);
      throw error;
    }
  }

  /**
   * Get All Share Price Index (ASPI) data
   */
  async getASPI() {
    try {
      const response = await this.client.post('aspiData');
      return response.data;
    } catch (error) {
      console.error('Error fetching ASPI data:', error.message);
      throw error;
    }
  }

  /**
   * Get S&P Sri Lanka 20 Index data
   */
  async getSNP() {
    try {
      const response = await this.client.post('snpData');
      return response.data;
    } catch (error) {
      console.error('Error fetching SNP data:', error.message);
      throw error;
    }
  }

  /**
   * Get trade summary for all securities
   */
  async getTradeSummary() {
    try {
      const response = await this.client.post('tradeSummary');
      return response.data;
    } catch (error) {
      console.error('Error fetching trade summary:', error.message);
      throw error;
    }
  }

  /**
   * Get chart data for a stock
   * @param {string} symbol - Stock symbol
   * @param {string} period - Period (1D, 1W, 1M, 3M, 1Y)
   */
  async getChartData(symbol, period = '1M') {
    try {
      // First get stock info to get stockId
      const stockInfo = await this.getStockInfo(symbol);
      
      // Get stockId (this would need to be mapped - you might need to fetch this separately)
      // This is a simplified version - you may need to get chartId from somewhere
      const params = new URLSearchParams();
      params.append('symbol', symbol);
      params.append('period', period);

      const response = await this.client.post('chartData', params);
      return response.data;
    } catch (error) {
      console.error(`Error fetching chart data for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all sectors data
   */
  async getAllSectors() {
    try {
      const response = await this.client.post('allSectors');
      return response.data;
    } catch (error) {
      console.error('Error fetching sectors data:', error.message);
      throw error;
    }
  }

  /**
   * Get detailed trades for a stock
   * @param {string} symbol - Stock symbol
   */
  async getDetailedTrades(symbol) {
    try {
      const params = new URLSearchParams();
      params.append('symbol', symbol);

      const response = await this.client.post('detailedTrades', params);
      return response.data;
    } catch (error) {
      console.error(`Error fetching detailed trades for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get daily market summary
   */
  async getDailyMarketSummary() {
    try {
      const response = await this.client.post('dailyMarketSummery');
      return response.data;
    } catch (error) {
      console.error('Error fetching daily market summary:', error.message);
      throw error;
    }
  }

  /**
   * Poll for real-time updates (every 60 seconds)
   * This will fetch latest prices for all active stocks
   */
  startRealTimePolling(intervalSeconds = 60) {
    console.log(`📊 Starting real-time stock polling every ${intervalSeconds} seconds...`);
    
    setInterval(async () => {
      try {
        // Get top gainers, losers, and most active as a quick market snapshot
        const [gainers, losers, active] = await Promise.all([
          this.getTopGainers().catch(() => null),
          this.getTopLosers().catch(() => null),
          this.getMostActive().catch(() => null)
        ]);

        console.log(`📈 Market update at ${new Date().toLocaleTimeString()}`);
        
        // You can emit this data via WebSocket to connected clients
        if (global.io) {
          global.io.emit('market-update', {
            timestamp: new Date(),
            gainers: gainers?.slice(0, 5),
            losers: losers?.slice(0, 5),
            mostActive: active?.slice(0, 5)
          });
        }

        // Update specific stock prices if you have a watchlist
        // This would require integration with your user's watchlist data
      } catch (error) {
        console.error('Error in real-time polling:', error.message);
      }
    }, intervalSeconds * 1000);
  }

  /**
   * Save stock price to database for historical tracking
   * @param {string} symbol - Stock symbol
   * @param {number} price - Current price
   */
  async saveStockPrice(symbol, price, change = null, changePercent = null, volume = null, marketCap = null) {
    try {
      const stockPrice = new StockPrice({
        symbol,
        price,
        change,
        changePercent,
        volume,
        marketCap,
        timestamp: new Date()
      });

      await stockPrice.save();
      return stockPrice;
    } catch (error) {
      console.error('Error saving stock price:', error.message);
      return null;
    }
  }

  /**
   * Get complete market snapshot
   * Fetches all key market data in one call
   */
  async getMarketSnapshot() {
    try {
      const [summary, aspi, snp, gainers, losers, active] = await Promise.all([
        this.getMarketSummary().catch(() => null),
        this.getASPI().catch(() => null),
        this.getSNP().catch(() => null),
        this.getTopGainers().catch(() => null),
        this.getTopLosers().catch(() => null),
        this.getMostActive().catch(() => null)
      ]);

      return {
        success: true,
        timestamp: new Date(),
        indices: {
          aspi: aspi?.[0],
          snp: snp?.[0]
        },
        marketSummary: summary,
        movers: {
          gainers: gainers?.slice(0, 10),
          losers: losers?.slice(0, 10),
          mostActive: active?.slice(0, 10)
        }
      };
    } catch (error) {
      console.error('Error fetching market snapshot:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }
}

module.exports = new RealTimeStockService();