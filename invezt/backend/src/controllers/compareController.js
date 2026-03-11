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
