import pdfParse from 'pdf-parse-new';
import axios from 'axios';

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

    async analyzeReport(pdfBuffer) {
        try {
            // 1. Extract text from PDF
            // We set verbosityLevel: 0 to silence font engine warnings like "TT: CALL empty stack"
            const pdfData = await pdfParse(pdfBuffer, { verbosityLevel: 0 });
            let text = pdfData.text;

            // Optional: Truncate text if it's monstrously huge (e.g., limit to first/last 20k chars)
            // But Gemini 1.5 Flash has 1M token context, so we can pass most reports intact.
            // Still, limiting to 250k chars is well within safety limits.
            if (text.length > 250000) {
               text = text.substring(0, 150000) + "\n... [MIDDLE SECTIONS OMITTED] ...\n" + text.substring(text.length - 100000);
            }

            // 2. Build the AI prompt
            const prompt = `
You are a highly analytical expert financial advisor and stock analyst.
I am providing you with the text extracted from a company's financial report or annual report.

Please carefully analyze the provided text and extract the key financial metrics, provide a rough intrinsic valuation estimate based on the raw numbers you see, and give an investment recommendation.

Respond ONLY with a valid JSON object matching this exact structure, with no markdown code blocks formatting containing the JSON, just the raw JSON string:
{
  "financialSummary": {
    "revenue": "Extracted revenue (e.g. '1.5 B LKR' or 'N/A')",
    "netIncome": "Extracted net income/profit",
    "eps": "Extracted Earnings Per Share if available",
    "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3"]
  },
  "valuation": {
    "estimatedIntrinsicValue": "A numeric estimate or range if possible, or 'Insufficient Data'",
    "currentMarketPriceMentioned": "Current price if mentioned in report",
    "methodologyUsed": "Brief description of how you quickly estimated this based on the doc"
  },
  "recommendation": {
    "signal": "One of: Strong Buy, Buy, Hold, Sell, Strong Sell",
    "justification": "A short 2-3 sentence explanation for this signal based on the report data."
  }
}

If the document does not appear to be a financial report, return "signal": "Hold" and explain that the document is invalid in the justification.

Here is the document text:
====================
${text}
====================
            `;

            // 3. Call Groq LLaMA 3.3 API (User preferred)
            const groqApiKey = process.env.groq_api_key;
            if (!groqApiKey) throw new Error('Groq API Key (groq_api_key) is not configured.');

            // We use llama-3.3-70b-versatile for high quality analysis
            const groqResponse = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a highly analytical expert financial advisor and stock analyst. You reply strictly in raw JSON without any markdown formatting.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.1,
                response_format: { type: "json_object" }
            }, {
                headers: {
                    'Authorization': `Bearer ${groqApiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 45000 
            });

            const rawOutput = groqResponse.data?.choices?.[0]?.message?.content;
            if (!rawOutput) throw new Error('No valid response received from Groq AI.');

            const analysis = JSON.parse(rawOutput.trim());
            return analysis;

        } catch (error) {
            console.error('Error analyzing report with Groq AI:', error);
            const detail = error.response?.data?.error?.message || error.message;
            throw new Error(`Failed to analyze the PDF report via Groq. Details: ${detail}`);
        }
    }
}

export default new ValuationService();