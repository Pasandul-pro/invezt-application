import axios from "axios";
import OpenAI from "openai";
import Financials from "../models/financialDocumentModel.js";

const cse_trade_summary_url = "https://www.cse.lk/api/tradeSummary";
const openai = new OpenAI ({ apiKey: process.env.openai_secret_key });

function divideValues (a, b){
  const x = Number(a);
  const y = Number(b);

  if(!Number.isFinite(x) || !Number.isFinite(y) || y === 0) return null;
  return x/y;
}
const percentage = (x) => (x == null ? null : x * 100);

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
};

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
  if (prevFinForPeg?.netProfit != null && prevFinForPeg?.weightedAvgShares != null) {
    const prevEps = safeDiv(prevFinForPeg.netProfit, prevFinForPeg.weightedAvgShares);
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




