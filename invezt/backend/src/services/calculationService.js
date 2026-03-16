import FinancialDocument from '../models/financialDocumentModel.js';
import CalculatedRatio from '../models/calculatedRatioModel.js';
import StockPrice from '../models/stockPriceModel.js';
import Stock from '../models/Stock.js';

class CalculationService {
  
  async calculateForStock(symbol) {
    try {
      const baseTicker = String(symbol).split('.')[0].toUpperCase();
      
      const financialDoc = await FinancialDocument.findOne({ 
          $or: [{ symbol: baseTicker }, { symbol: symbol.toUpperCase() }] 
        })
        .sort({ 'period.periodEndDate': -1 });
      
      if (!financialDoc) {
        console.warn(`No financial document found for ${symbol} (base: ${baseTicker})`);
        return null;
      }

      const stockDoc = await Stock.findOne({ ticker: baseTicker });
      const latestPrice = await StockPrice.findOne({ 
          $or: [{ symbol: baseTicker }, { symbol: symbol.toUpperCase() }] 
        })
        .sort({ timestamp: -1 });
      const currentPrice = latestPrice?.price || stockDoc?.currentPrice || 0;

      if (!currentPrice || currentPrice === 0) {
        console.warn(`No price found for ${symbol} (base: ${baseTicker})`);
        // We continue anyway if we have EPS/BVPS, but PE/PB will be null
      }

      const prevDoc = await FinancialDocument.findOne({
        $or: [{ symbol: baseTicker }, { symbol: symbol.toUpperCase() }],
        'period.fiscalYear': financialDoc.period.fiscalYear - 1
      });

      const ratios = {
        peRatio: this.calculatePE(currentPrice, financialDoc.eps),
        pbRatio: this.calculatePB(currentPrice, financialDoc.bookValuePerShare),
        roe: this.calculateROE(financialDoc.netIncome, financialDoc.shareholdersEquity),
        roa: this.calculateROA(financialDoc.netIncome, financialDoc.totalAssets),
        debtToEquity: this.calculateDebtToEquity(financialDoc.totalDebt, financialDoc.shareholdersEquity),
        currentRatio: this.calculateCurrentRatio(financialDoc.currentAssets, financialDoc.currentLiabilities),
        quickRatio: this.calculateQuickRatio(financialDoc.currentAssets, financialDoc.inventory, financialDoc.currentLiabilities),
        eps: financialDoc.eps,
        dividendYield: this.calculateDividendYield(financialDoc.dividendPerShare, currentPrice),
        pegRatio: this.calculatePEG(currentPrice, financialDoc.eps, this.calculateGrowth(financialDoc.eps, prevDoc?.eps))
      };

      const calculatedRatio = new CalculatedRatio({
        stockId: financialDoc.stockId,
        symbol: symbol,
        financialDocumentId: financialDoc._id,
        period: financialDoc.period,
        ratios: {
          ...ratios,
          pe: ratios.peRatio,
          pb: ratios.pbRatio,
          peg: ratios.pegRatio
        }
      });

      await calculatedRatio.save();

      // Also update the Stock model's ratios field for the Dashboard
      await Stock.findOneAndUpdate(
        { ticker: baseTicker },
        { 
          $set: { 
            ratios: ratios,
            currentPrice: currentPrice,
            lastUpdate: new Date()
          } 
        },
        { new: true }
      );

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

      const financialDoc = await FinancialDocument.findById(latestRatios.financialDocumentId);
      
      let updatedRatios = { ...latestRatios.ratios };
      
      if (financialDoc && latestPrice) {
        updatedRatios.pe = this.calculatePE(latestPrice.price, financialDoc.eps);
        updatedRatios.pb = this.calculatePB(latestPrice.price, financialDoc.bookValuePerShare);
        updatedRatios.dividendYield = this.calculateDividendYield(
          financialDoc.dividendPerShare, 
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

export default new CalculationService();