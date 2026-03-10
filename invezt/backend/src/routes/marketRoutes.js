import express from "express";
import { MongoClient } from "mongodb";

const router = express.Router();

const client = new MongoClient("mongodb://localhost:27017");

router.get("/market", async (req, res) => {

    await client.connect();

    const db = client.db("invezt");

    const stocks = await db.collection("marketData").find().toArray();

    res.json(stocks);

});

router.get("/stock/:symbol", async (req, res) => {

    await client.connect();

    const db = client.db("invezt");

    const stock = await db.collection("marketData").findOne({
        symbol: req.params.symbol
    });

    res.json(stock);

});

export default router;