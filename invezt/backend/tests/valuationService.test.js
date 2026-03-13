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
        });
    });
});
