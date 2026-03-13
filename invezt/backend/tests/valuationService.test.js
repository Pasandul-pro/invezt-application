import valuationService from '../src/services/valuationService.js';

describe('ValuationService', () => {
    describe('calculateDCF', () => {
        it('should calculate DCF correctly', () => {
            const data = {
                cashFlows: [100, 110, 121, 133.1],
                discountRate: 10,
                perpetualGrowthRate: 2,
                sharesOutstanding: 100
            };
            const result = valuationService.calculateDCF(data);
            
            expect(result.intrinsicValue).toBeDefined();
            expect(result.enterpriseValue).toBeDefined();
            expect(result.pvCashFlows).toBeGreaterThan(0);
            expect(result.pvTerminal).toBeGreaterThan(0);
        });

        it('should handle zero sharesOutstanding', () => {
            const data = {
                cashFlows: [100],
                discountRate: 10,
                perpetualGrowthRate: 2,
                sharesOutstanding: 0
            };
            const result = valuationService.calculateDCF(data);
            expect(result.intrinsicValue).toEqual(result.enterpriseValue);
        });
    });

    describe('calculateCAPM', () => {
        it('should calculate expected return correctly', () => {
            const data = {
                riskFreeRate: 5,
                beta: 1.2,
                marketRiskPremium: 7
            };
            const result = valuationService.calculateCAPM(data);
            // 5 + 1.2 * 7 = 5 + 8.4 = 13.4
            expect(result.expectedReturn).toBe(13.4);
        });
    });

    describe('calculateGordon', () => {
        it('should calculate fair value and upside', () => {
            const data = {
                currentDividend: 2,
                requiredReturn: 10,
                dividendGrowthRate: 5,
                currentPrice: 40
            };
            const result = valuationService.calculateGordon(data);
            // Next Div = 2 * 1.05 = 2.1
            // Fair Value = 2.1 / (0.10 - 0.05) = 2.1 / 0.05 = 42
            // Upside = (42 - 40) / 40 = 2 / 40 = 0.05 = 5%
            expect(result.fairValue).toBe(42);
            expect(result.upside).toBe(5);
            expect(result.recommendation).toBe('Hold');
        });
    });

    describe('getRecommendation', () => {
        it('should return Strong Buy for high upside', () => {
            expect(valuationService.getRecommendation(35)).toBe('Strong Buy');
        });
        it('should return Strong Sell for high downside', () => {
            expect(valuationService.getRecommendation(-30)).toBe('Strong Sell');
        });
    });
});
