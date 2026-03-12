import axios from 'axios';
import OpenAI from 'openai';
import Financials from '../models/financialDocumentModel.js';

const CSE_TRADE_SUMMARY_URL = 'https://www.cse.lk/api/tradeSummary';

// OpenAI client — uses OPENAI_API_KEY from .env
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function safeDiv(a, b) {
  const x = Number(a);
  const y = Number(b);
  if (!Number.isFinite(x) || !Number.isFinite(y) || y === 0) return null;
  return x / y;
}

const pct = (x) => (x == null ? null : parseFloat((x * 100).toFixed(2)));
const round2 = (x) => (x == null ? null : parseFloat(x.toFixed(2)));

async function getLatestPrices(symbols) {
  try {
    const { data } = await axios.post(CSE_TRADE_SUMMARY_URL, {}, {
      timeout: 15000,
      headers: { 'User-Agent': 'invezt-app', 'Accept': 'application/json' }
    });

    const list = Array.isArray(data) ? data : data?.data ?? data?.content ?? [];
    const out = new Map();

    for (const sym of symbols) {
      const symbol = String(sym).toUpperCase().trim();
      const row = list.find(
        (x) => String(x?.symbol || x?.securityCode || '').toUpperCase() === symbol
      );
      const price = row?.lastTradedPrice ?? row?.lastPrice ?? row?.price ?? null;
      out.set(symbol, price == null ? null : Number(price));
    }
    return out;
  } catch (e) {
    console.warn('CSE price fetch failed:', e.message);
    return new Map();
  }
}

function computeRatios(fin, lastPrice, prevFin) {
  const eps = safeDiv(fin.netProfit, fin.weightedAvgShares);
  const pe = lastPrice != null && eps != null ? safeDiv(lastPrice, eps) : null;

  let growthPct = null;
  if (prevFin?.netProfit != null && prevFin?.weightedAvgShares != null) {
    const prevEps = safeDiv(prevFin.netProfit, prevFin.weightedAvgShares);
    if (prevEps != null && prevEps !== 0 && eps != null) {
      growthPct = ((eps - prevEps) / Math.abs(prevEps)) * 100;
    }
  }

  return {
    roePercent:              pct(safeDiv(fin.netProfit, fin.totalEquity)),
    roaPercent:              pct(safeDiv(fin.netProfit, fin.totalAssets)),
    eps:                     round2(eps),
    pe:                      round2(pe),
    debtToEquity:            round2(safeDiv(fin.totalLiabilities, fin.totalEquity)),
    currentRatio:            round2(safeDiv(fin.currentAssets, fin.currentLiabilities)),
    quickRatio:              round2(safeDiv(
                               fin.currentAssets != null && fin.inventory != null
                                 ? fin.currentAssets - fin.inventory : null,
                               fin.currentLiabilities
                             )),
    grossProfitMarginPercent: pct(safeDiv(fin.grossProfit, fin.revenue)),
    epsGrowthPercent:        growthPct != null ? parseFloat(growthPct.toFixed(2)) : null,
    peg:                     (pe != null && growthPct != null && growthPct !== 0)
                               ? round2(safeDiv(pe, growthPct)) : null
  };
}

/**
 * Build a concise data summary string for OpenAI to analyse.
 */
function buildInsightPrompt(companies, period) {
  const lines = companies
    .filter(c => !c.missing)
    .map(c => {
      const r = c.ratios;
      return `
Company: ${c.symbol}
  Live Price (LKR): ${c.lastPrice ?? 'N/A'}
  P/E Ratio: ${r.pe ?? 'N/A'}
  ROE (%): ${r.roePercent ?? 'N/A'}
  ROA (%): ${r.roaPercent ?? 'N/A'}
  Debt/Equity: ${r.debtToEquity ?? 'N/A'}
  Current Ratio: ${r.currentRatio ?? 'N/A'}
  EPS (LKR): ${r.eps ?? 'N/A'}
  EPS Growth (%): ${r.epsGrowthPercent ?? 'N/A'}
  Profit Margin (%): ${r.grossProfitMarginPercent ?? 'N/A'}
  PEG Ratio: ${r.peg ?? 'N/A'}`;
    })
    .join('\n');

  return `You are a senior equity analyst specialising in the Colombo Stock Exchange (CSE) in Sri Lanka.

Given the following ${period.periodType} ${period.year} financial data for ${companies.length} CSE-listed companies, provide a concise, data-driven investment comparison. Your response must:
1. Identify which company appears most attractively valued and why
2. Highlight the key strengths and weaknesses of each company across the ratios
3. Flag any financial risk signals (e.g. high debt, negative margins)
4. Give a brief recommendation suitable for a retail investor (2-3 sentences max per company)

Keep the response clear and structured. Reference specific numbers from the data. Do not add disclaimers beyond noting these are based on the figures provided.

---
${lines}
---`;
}

export async function compareCompanies(req, res) {
  try {
    const symbols = String(req.query.symbols || '')
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, 3);

    const periodType = String(req.query.periodType || 'ANNUAL').toUpperCase();
    const year = Number(req.query.year);
    const quarter = req.query.quarter != null ? Number(req.query.quarter) : null;

    if (symbols.length < 1)
      return res.status(400).json({ status: 'error', message: 'Provide 1–3 stock symbols' });
    if (!['ANNUAL', 'QUARTERLY'].includes(periodType))
      return res.status(400).json({ status: 'error', message: 'periodType must be ANNUAL or QUARTERLY' });
    if (!Number.isFinite(year))
      return res.status(400).json({ status: 'error', message: 'year is required (e.g. 2024)' });
    if (periodType === 'QUARTERLY' && !Number.isFinite(quarter))
      return res.status(400).json({ status: 'error', message: 'quarter required for QUARTERLY (1–4)' });

    // Fetch live prices from CSE
    const priceMap = await getLatestPrices(symbols);

    // Fetch current and previous period financials from DB
    const finQuery = {
      symbol: { $in: symbols },
      periodType,
      fiscalYear: year,
      ...(periodType === 'QUARTERLY' ? { fiscalQuarter: quarter } : {})
    };
    const fins = await Financials.find(finQuery).lean();
    const finMap = new Map(fins.map((f) => [f.symbol, f]));

    const prevQuery = periodType === 'ANNUAL'
      ? { symbol: { $in: symbols }, periodType, fiscalYear: year - 1 }
      : quarter === 1
        ? { symbol: { $in: symbols }, periodType, fiscalYear: year - 1, fiscalQuarter: 4 }
        : { symbol: { $in: symbols }, periodType, fiscalYear: year, fiscalQuarter: quarter - 1 };

    const prevFins = await Financials.find(prevQuery).lean();
    const prevMap = new Map(prevFins.map((f) => [f.symbol, f]));

    // Build company results with ratios
    const companies = symbols.map((symbol) => {
      const fin = finMap.get(symbol) || null;
      const prevFin = prevMap.get(symbol) || null;
      const lastPrice = priceMap.get(symbol) ?? null;

      if (!fin) {
        return {
          symbol,
          lastPrice,
          ratios: null,
          missing: true,
          message: 'Financial data not found in database for this period'
        };
      }

      return {
        symbol,
        lastPrice,
        ratios: computeRatios(fin, lastPrice, prevFin),
        missing: false
      };
    });

    // Generate AI insights via OpenAI (only if we have at least one company with data)
    let aiInsights = null;
    const companiesWithData = companies.filter(c => !c.missing);

    if (companiesWithData.length > 0 && process.env.OPENAI_API_KEY) {
      try {
        const prompt = buildInsightPrompt(companies, { periodType, year, quarter });
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800,
          temperature: 0.4
        });
        aiInsights = completion.choices[0]?.message?.content || null;
      } catch (aiError) {
        console.warn('OpenAI insight generation failed:', aiError.message);
        aiInsights = null; // Non-fatal — return ratios without AI insights
      }
    }

    return res.json({
      status: 'success',
      period: { periodType, year, quarter: periodType === 'QUARTERLY' ? quarter : null },
      companies,
      aiInsights  // null if OpenAI unavailable or no data found
    });

  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Compare failed',
      error: err.message
    });
  }
}
