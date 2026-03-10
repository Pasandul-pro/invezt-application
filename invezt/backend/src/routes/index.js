import express from 'express';
import newsRoutes from './news.routes.js';

const router = express.Router();

router.use('/news', newsRoutes);

// Health check
router.get('/health', (req, res) => res.json({ status: 'UP' }));
