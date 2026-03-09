const FinancialDocument = require('../models/financialDocumentModel');
const CalculatedRatio = require('../models/calculatedRatioModel');
const StockPrice = require('../models/stockPriceModel');

class CalculationService {
  
  /**
   * Calculate all 10 ratios for a stock
   */
  async calculateForStock(symbol) {
    try {
      // Get latest financial data
      const financialDoc = await FinancialDocument.findOne({ symbol })
        .sort({ 'period.periodEndDate': -1 });
      
      if (!financialDoc) return null;

      // Get latest stock price
      const latestPrice = await StockPrice.findOne({ symbol })
        .sort({ timestamp: -1 });
      const currentPrice = latestPrice?.price || 0;

      // Get previous data for growth calculation
      const prevDoc = await FinancialDocument.findOne({
        symbol,
        'period.fiscalYear': financialDoc.period.fiscalYear - 1
      });

      const data = financialDoc.financialData;
      const prevData = prevDoc?.financialData;

      // Calculate 10 ratios
      const ratios = {
        pe: this.calculatePE(currentPrice, data.eps),
        pb: this.calculatePB(currentPrice, data.bookValuePerShare),
        roe: this.calculateROE(data.netIncome, data.shareholdersEquity),
        roa: this.calculateROA(data.netIncome, data.totalAssets),
        debtToEquity: this.calculateDebtToEquity(data.totalDebt, data.shareholdersEquity),
        currentRatio: this.calculateCurrentRatio(data.currentAssets, data.currentLiabilities),
        quickRatio: this.calculateQuickRatio(data.currentAssets, data.inventory, data.currentLiabilities),
        eps: data.eps,
        dividendYield: this.calculateDividendYield(data.dividendPerShare, currentPrice),
        peg: this.calculatePEG(currentPrice, data.eps, this.calculateGrowth(data.eps, prevData?.eps))
      };

      // Save to database
      const calculatedRatio = new CalculatedRatio({
        stockId: financialDoc.stockId,
        symbol: symbol,
        financialDocumentId: financialDoc._id,
        period: financialDoc.period,
        ratios: ratios
      });

      await calculatedRatio.save();
      return calculatedRatio;

    } catch (error) {
      console.error('Error in calculation service:', error);
      return null;
    }
  }

  calculatePE(price, eps) {
    if (!eps || eps === 0) return null;
    return Number((price / eps).toFixed(2));
  }

  calculatePB(price, bookValue) {
    if (!bookValue || bookValue === 0) return null;
    return Number((price / bookValue).toFixed(2));
  }

  calculateROE(netIncome, equity) {
    if (!equity || equity === 0) return null;
    return Number(((netIncome / equity) * 100).toFixed(2));
  }

  calculateROA(netIncome, assets) {
    if (!assets || assets === 0) return null;
    return Number(((netIncome / assets) * 100).toFixed(2));
  }

  calculateDebtToEquity(debt, equity) {
    if (!equity || equity === 0) return null;
    return Number((debt / equity).toFixed(2));
  }

  calculateCurrentRatio(currentAssets, currentLiabilities) {
    if (!currentLiabilities || currentLiabilities === 0) return null;
    return Number((currentAssets / currentLiabilities).toFixed(2));
  }

  calculateQuickRatio(currentAssets, inventory, currentLiabilities) {
    if (!currentLiabilities || currentLiabilities === 0) return null;
    const quickAssets = currentAssets - (inventory || 0);
    return Number((quickAssets / currentLiabilities).toFixed(2));
  }

  calculateDividendYield(dividend, price) {
    if (!price || price === 0 || !dividend) return null;
    return Number(((dividend / price) * 100).toFixed(2));
  }

  calculatePEG(price, eps, growthRate) {
    const pe = this.calculatePE(price, eps);
    if (!pe || !growthRate || growthRate === 0) return null;
    return Number((pe / growthRate).toFixed(2));
  }

  calculateGrowth(current, previous) {
    if (!current || !previous || previous === 0) return null;
    return Number(((current - previous) / previous * 100).toFixed(2));
  }

  /**
   * Get real-time ratios for frontend
   */
  async getRealTimeRatios(symbol) {
    try {
      const latestRatios = await CalculatedRatio.findOne({ symbol })
        .sort({ calculationTimestamp: -1 });

      const latestPrice = await StockPrice.findOne({ symbol })
        .sort({ timestamp: -1 });

      if (!latestRatios) {
        return {
          symbol,
          currentPrice: latestPrice?.price,
          lastUpdated: latestPrice?.timestamp,
          ratios: null,
          message: 'No ratios calculated yet'
        };
      }

      // Update price-dependent ratios with latest price
      const financialDoc = await FinancialDocument.findById(latestRatios.financialDocumentId);
      
      let updatedRatios = { ...latestRatios.ratios };
      
      if (financialDoc && latestPrice) {
        updatedRatios.pe = this.calculatePE(latestPrice.price, financialDoc.financialData.eps);
        updatedRatios.pb = this.calculatePB(latestPrice.price, financialDoc.financialData.bookValuePerShare);
        updatedRatios.dividendYield = this.calculateDividendYield(
          financialDoc.financialData.dividendPerShare, 
          latestPrice.price
        );
      }

      return {
        symbol,
        currentPrice: latestPrice?.price,
        lastUpdated: latestPrice?.timestamp,
        ratios: updatedRatios
      };
    } catch (error) {
      console.error('Error getting real-time ratios:', error);
      return null;
    }
  }
}

module.exports = new CalculationService();