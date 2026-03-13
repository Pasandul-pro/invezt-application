import calculationService from '../src/services/calculationService.js';

// Mock the models
jest.mock('../src/models/financialDocumentModel.js');
jest.mock('../src/models/calculatedRatioModel.js');
jest.mock('../src/models/stockPriceModel.js');

describe('CalculationService', () => {
    describe('calculatePE', () => {
        it('should calculate PE ratio correctly', () => {
            expect(calculationService.calculatePE(100, 5)).toBe(20);
        });
        it('should return null if EPS is zero', () => {
            expect(calculationService.calculatePE(100, 0)).toBeNull();
        });
    });

    describe('calculateROE', () => {
        it('should calculate ROE correctly', () => {
            expect(calculationService.calculateROE(10, 100)).toBe(10);
        });
        it('should return null if equity is zero', () => {
            expect(calculationService.calculateROE(10, 0)).toBeNull();
        });
    });

    describe('calculateQuickRatio', () => {
        it('should calculate Quick Ratio correctly', () => {
            expect(calculationService.calculateQuickRatio(100, 20, 40)).toBe(2);
        });
        it('should handle missing inventory', () => {
            expect(calculationService.calculateQuickRatio(100, null, 50)).toBe(2);
        });
    });

    describe('calculateGrowth', () => {
        it('should calculate growth rate correctly', () => {
            expect(calculationService.calculateGrowth(110, 100)).toBe(10);
        });
        it('should return null if previous value is zero', () => {
            expect(calculationService.calculateGrowth(110, 0)).toBeNull();
        });
    });
});
