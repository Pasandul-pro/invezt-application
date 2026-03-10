class ValuationService {
    
    calculateDCF(data) {
        const { cashFlows, discountRate, perpetualGrowthRate, sharesOutstanding } = data;
        
        const r = discountRate / 100;
        const g = perpetualGrowthRate / 100;
        
        let pvCashFlows = 0;
        cashFlows.forEach((cf, year) => {
            pvCashFlows += cf / Math.pow(1 + r, year + 1);
        });
        
        const lastCashFlow = cashFlows[cashFlows.length - 1];
        const terminalValue = (lastCashFlow * (1 + g)) / (r - g);
        const pvTerminal = terminalValue / Math.pow(1 + r, cashFlows.length);
        
        const enterpriseValue = pvCashFlows + pvTerminal;
        const intrinsicValue = sharesOutstanding ? enterpriseValue / sharesOutstanding : enterpriseValue;
        
        return {
            intrinsicValue: Number(intrinsicValue.toFixed(2)),
            enterpriseValue: Number(enterpriseValue.toFixed(2)),
            pvCashFlows: Number(pvCashFlows.toFixed(2)),
            pvTerminal: Number(pvTerminal.toFixed(2))
        };
    }

    calculateCAPM(data) {
        const { riskFreeRate, beta, marketRiskPremium } = data;
        
        const expectedReturn = riskFreeRate + beta * marketRiskPremium;
        
        return {
            expectedReturn: Number(expectedReturn.toFixed(2)),
            riskFreeRate,
            beta,
            marketRiskPremium
        };
    }

    calculateGordon(data) {
        const { currentDividend, requiredReturn, dividendGrowthRate, currentPrice } = data;
        
        const r = requiredReturn / 100;
        const g = dividendGrowthRate / 100;
        
        const nextDividend = currentDividend * (1 + g);
        const fairValue = nextDividend / (r - g);
        
        const upside = currentPrice ? ((fairValue - currentPrice) / currentPrice) * 100 : null;
        
        return {
            fairValue: Number(fairValue.toFixed(2)),
            nextYearDividend: Number(nextDividend.toFixed(2)),
            upside: upside ? Number(upside.toFixed(2)) : null,
            recommendation: this.getRecommendation(upside)
        };
    }

    calculateComparable(data) {
        const { peerPE, peerPB, companyEPS, companyBVPS, currentPrice } = data;
        
        const avgPE = peerPE.reduce((a, b) => a + b, 0) / peerPE.length;
        const avgPB = peerPB.reduce((a, b) => a + b, 0) / peerPB.length;
        
        const peValue = companyEPS * avgPE;
        const pbValue = companyBVPS * avgPB;
        const fairValue = (peValue + pbValue) / 2;
        
        const upside = currentPrice ? ((fairValue - currentPrice) / currentPrice) * 100 : null;
        
        return {
            fairValue: Number(fairValue.toFixed(2)),
            peBasedValue: Number(peValue.toFixed(2)),
            pbBasedValue: Number(pbValue.toFixed(2)),
            avgPE: Number(avgPE.toFixed(2)),
            avgPB: Number(avgPB.toFixed(2)),
            upside: upside ? Number(upside.toFixed(2)) : null,
            recommendation: this.getRecommendation(upside)
        };
    }

    getRecommendation(upside) {
        if (!upside) return 'Hold';
        if (upside > 30) return 'Strong Buy';
        if (upside > 15) return 'Buy';
        if (upside > -10) return 'Hold';
        if (upside > -25) return 'Sell';
        return 'Strong Sell';
    }
}

export default new ValuationService();