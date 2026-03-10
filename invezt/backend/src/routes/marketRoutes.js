import express from "express";
import { MongoClient } from "mongodb";

const router = express.Router();
const client = new MongoClient("mongodb://localhost:27017");

router.get("/market", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("invezt");
    const stocks = await db.collection("marketData").find().toArray();
    res.json(stocks);
  } catch (err) {
    console.error("Error fetching market data:", err);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
});

router.get("/stock/:symbol", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("invezt");
    const stock = await db.collection("marketData").findOne({
      symbol: req.params.symbol.toUpperCase(),
    });
    if (!stock) return res.status(404).json({ error: "Stock not found" });
    res.json(stock);
  } catch (err) {
    console.error("Error fetching stock:", err);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

export default router;