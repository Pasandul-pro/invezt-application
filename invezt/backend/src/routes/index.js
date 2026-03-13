import express from "express";
import mongoose from "mongoose";
import authRoutes from "./auth.routes.js";
import newsRoutes from "./news.routes.js";
import valuationRoutes from "./valuation.routes.js";
import portfolioRoutes from "./portfolio.routes.js";
import financialRoutes from "./financial.routes.js";
import stockRoutes from "./stock.routes.js";
import compareRoutes from "./compare.routes.js";
import marketRoutes from "./market.routes.js";
import watchlistRoutes from "./watchlist.routes.js";

const router = express.Router();

router.get("/health", (req, res) =>
  res.json({
    status: "UP",
    timestamp: new Date(),
    db: {
      state: mongoose.connection.readyState,
      connected: mongoose.connection.readyState === 1,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
    },
  }),
);

router.use("/auth", authRoutes);
router.use("/news", newsRoutes);
router.use("/valuation", valuationRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/financial", financialRoutes);
router.use("/stocks", stockRoutes);
router.use("/compare", compareRoutes);
router.use("/market", marketRoutes);
router.use("/watchlist", watchlistRoutes);

export default router;
