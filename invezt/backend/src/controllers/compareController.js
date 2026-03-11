import axios from "axios";
import OpenAI from "openai";
import Financials from "../models/financialDocumentModel.js";

const cse_trade_summary_url = "https://www.cse.lk/api/tradeSummary";
const openai = new OpenAI ({ apiKey: process.env.openai_secret_key });

function safeDiv (a, b){
  const x = Number(a);
  const y = Number(b);

  if(!Number.isFinite(x) || !Number.isFinite(y) || y === 0) return null;
  return x/y;
}
const pct = (x) => (x == null ? null : x * 100);

async function getLatestPrices(symbols){
  const {data} = await axios.post(
    cse_trade_summary_url,
    {},
    {
      timeout: 15000,
      headers: {
        "User-Agent": "invezt",
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    }
);

const list = Array.isArray(data) ? data: data?.data ?? data?.content ?? [];
const out = new Map();

for (const sym of symbols) {
  const symbol = String(sym).toUpperCase().trim();
  const row = list.find(
    (x) => String(x?.symbol || x?.securityCode || "").toUpperCase() === symbol
  );
  const lastTradedPrice =
    row?.lastTradedPrice ?? row?.lastPrice ?? row?.price ?? null;

  out.set(symbol, lastTradedPrice == null ? null : Number(lastTradedPrice));
  }
return out;
}

function computeRatios(fin, lastPrice, lastYearData){
  const eps = safeDiv(fin.netProfit, fin.weightedAvgShares);
  const pe = lastPrice != null && eps != null ? safeDiv(lastPrice, eps) : null;

  const earningsYield = pe != null ? safeDiv(1, pe) : null;

  let growthPct = null;
  if (lastYearData?.netProfit != null && lastYearData?.weightedAvgShares != null) {
    const prevEps = safeDiv(lastYearData.netProfit, lastYearData.weightedAvgShares);
    if (prevEps != null && prevEps !== 0 && eps != null) {
      growthPct = ((eps - prevEps) / Math.abs(prevEps)) * 100;
    }
}

  const peg =
    pe != null && growthPct != null && growthPct !== 0 ? safeDiv(pe, growthPct) : null;

  return {
    roePercent: pct(safeDiv(fin.netProfit, fin.totalEquity)),
    roaPercent: pct(safeDiv(fin.netProfit, fin.totalAssets)),
    eps,
    pe,
    earningsYieldPercent: pct(earningsYield),
    debtToEquity: safeDiv(fin.totalLiabilities, fin.totalEquity),
    currentRatio: safeDiv(fin.currentAssets, fin.currentLiabilities),
    quickRatio: safeDiv(
      fin.currentAssets != null && fin.inventory != null ? fin.currentAssets - fin.inventory : null,
      fin.currentLiabilities
    ),
    grossProfitMarginPercent: pct(safeDiv(fin.grossProfit, fin.revenue)),
    peg,
  };
}

export async function compareCompanies(req, res) {
  try {
    const symbols = String(req.query.symbols || "")
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, 3);

    const periodType = String(req.query.periodType || "ANNUAL").toUpperCase();
    const year = Number(req.query.year);
    const quarter = req.query.quarter != null ? Number(req.query.quarter) : null;

    if (symbols.length < 1)
      return res.status(400).json({ status: "error", message: "symbols required (1-3)" });

    if (!["ANNUAL", "QUARTERLY"].includes(periodType))
      return res.status(400).json({
        status: "error",
        message: "periodType must be ANNUAL or QUARTERLY",
      });

    if (!Number.isFinite(year))
      return res.status(400).json({ status: "error", message: "year is required" });

    if (periodType === "QUARTERLY" && !Number.isFinite(quarter))
      return res.status(400).json({
        status: "error",
        message: "quarter required for QUARTERLY (1-4)",
      });
    let priceMap = new Map();
    try {
      priceMap = await getLatestPrices(symbols);
    } catch (e) {
      console.warn("CSE price fetch failed:", e.message);
  }

    const finQuery = {
      symbol: { $in: symbols },
      periodType,
      fiscalYear: year,
      ...(periodType === "QUARTERLY" ? { fiscalQuarter: quarter } : {}),
    };

    const fins = await Financials.find(finQuery).lean();
    const finMap = new Map(fins.map((f) => [f.symbol, f]));

    const prevQuery =
      periodType === "ANNUAL"
        ? { symbol: { $in: symbols }, periodType, fiscalYear: year - 1 }
        : quarter === 1
          ? { symbol: { $in: symbols }, periodType, fiscalYear: year - 1, fiscalQuarter: 4 }
          : { symbol: { $in: symbols }, periodType, fiscalYear: year, fiscalQuarter: quarter - 1 };

    const prevFins = await Financials.find(prevQuery).lean();
    const prevMap = new Map(prevFins.map((f) => [f.symbol, f]));

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
          message: "Financials not found in DB for this period",
        };
      }
      return {
        symbol,
        lastPrice,
        ratios: computeRatios(fin, lastPrice, prevFin),
        missing: false,
      };
    });

    let recommendation = "AI recommendation not available.";

     if (process.env.openai_secret_key) {
      const prompt =
        "You are a financial analyst specializing in Sri Lankan stocks. " +
        "Given these companies and their financial ratios, recommend the best one to invest in and why. " +
        "Keep it brief and clear.\n\n" +
        `Companies data: ${JSON.stringify(companies)}`;

       const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

       recommendation = aiResponse?.choices?.[0]?.message?.content || "No AI response.";
    }

    return res.json({
      status: "success",
      period: { periodType, year, quarter: periodType === "QUARTERLY" ? quarter : null },
      companies,
      recommendation,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "compare failed",
      error: err.message,
    });
  }
}




