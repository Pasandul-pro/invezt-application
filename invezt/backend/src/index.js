import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/error.middleware.js';
import routes from './routes/index.js';
import cseIntegrationService from './services/cseIntegrationService.js';
import realTimeStockService from './services/realTimeStockService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://invezt.lk'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Invezt API is running',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use(errorHandler);

// ── Start HTTP server FIRST — never block on MongoDB ─────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 GBM simulator active — prices update every 15 s`);
  console.log(`⚡ API ready at http://localhost:${PORT}/api`);
});

// ── MongoDB: connect in background, retry every 30 s ─────────────────────────
async function connectDB(retryCount = 0) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️  MONGODB_URI not set — database features disabled');
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,  // 10 s timeout per attempt
      connectTimeoutMS: 10000
    });
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);

    // Only start DB-dependent background services after connection
    try { cseIntegrationService.startPolling(); }             catch {}
    try { realTimeStockService.startRealTimePolling(3600); }  catch {}

  } catch (error) {
    const wait = Math.min(30, 5 * (retryCount + 1)); // 5 s, 10 s, 15 s … max 30 s
    console.warn(`⚠️  MongoDB unavailable (${error.message})`);
    console.warn(`   Retrying in ${wait}s… (attempt ${retryCount + 1})`);
    setTimeout(() => connectDB(retryCount + 1), wait * 1000);
  }
}

// Kick off DB connection attempt — server is already listening
connectDB();
