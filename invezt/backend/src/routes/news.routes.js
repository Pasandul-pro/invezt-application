import express from 'express';
import { newsController } from '../controller/news.controller.js';

const router = express.Router();

/**
 * @route GET /api/news/search
 * @desc Search for news articles
 */
