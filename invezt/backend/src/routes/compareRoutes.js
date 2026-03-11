import express from "express";
import authenticationMiddleware from "../middlewares/authenticationMiddleware.js";
import { compareCompanies } from "../controllers/compareController.js";

const router = express.Router();

router.get("/", authenticationMiddleware, compareCompanies);
export default router;
