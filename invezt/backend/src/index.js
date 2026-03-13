import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { errorHandler } from "./middleware/error.middleware.js";
import routes from "./routes/index.js";
import cseIntegrationService from "./services/cseIntegrationService.js";
import realTimeStockService from "./services/realTimeStockService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DEFAULT_LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/invezt";
let activeMongoLabel = "disconnected";
let dbServicesStarted = false;

function getMongoConnectionState() {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return states[mongoose.connection.readyState] || "unknown";
}

function maskMongoUri(uri) {
  try {
    const parsed = new URL(uri);
    if (parsed.password) parsed.password = "***";
    return parsed.toString();
  } catch {
    return "configured";
  }
}

function getMongoCandidates() {
  const configuredUris = [
    process.env.MONGODB_URI,
    process.env.MONGODB_FALLBACK_URI,
    process.env.MONGODB_LOCAL_URI,
  ].filter(Boolean);

  if (
    process.env.NODE_ENV !== "production" &&
    !configuredUris.includes(DEFAULT_LOCAL_MONGO_URI)
  ) {
    configuredUris.push(DEFAULT_LOCAL_MONGO_URI);
  }

  return [...new Set(configuredUris)].map((uri, index) => ({
    uri,
    label: index === 0 ? "primary" : "fallback",
  }));
}

function startDbServicesOnce() {
  if (dbServicesStarted) return;
  dbServicesStarted = true;

  try {
    cseIntegrationService.startPolling();
  } catch {}
  try {
    realTimeStockService.startRealTimePolling(600);
  } catch {}
}

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://invezt.lk",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow known origins, or any localhost/127.0.0.1 local development port
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Invezt API is running",
    db: getMongoConnectionState(),
    dbTarget: activeMongoLabel,
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
  if (
    mongoose.connection.readyState === 1 ||
    mongoose.connection.readyState === 2
  ) {
    return;
  }

  const candidates = getMongoCandidates();
  if (candidates.length === 0) {
    activeMongoLabel = "disabled";
    console.warn("⚠️  No MongoDB URI configured — database features disabled");
    return;
  }

  let lastError = null;

  try {
    for (const candidate of candidates) {
      try {
        await mongoose.connect(candidate.uri, {
          serverSelectionTimeoutMS: 10000,
          connectTimeoutMS: 10000,
        });

        activeMongoLabel = `${candidate.label}:${maskMongoUri(candidate.uri)}`;
        console.log(
          `✅ MongoDB Connected (${candidate.label}): ${mongoose.connection.host}`,
        );
        startDbServicesOnce();
        return;
      } catch (error) {
        lastError = error;
        console.warn(
          `⚠️  MongoDB ${candidate.label} unavailable (${error.message})`,
        );
      }
    }

    const wait = Math.min(30, 5 * (retryCount + 1)); // 5 s, 10 s, 15 s … max 30 s
    activeMongoLabel = "retrying";
    console.warn(
      "   Atlas may need your current IP whitelisted, or start a local MongoDB instance for fallback.",
    );
    console.warn(`   Retrying in ${wait}s… (attempt ${retryCount + 1})`);
    setTimeout(() => connectDB(retryCount + 1), wait * 1000);
  } catch (error) {
    activeMongoLabel = "error";
    const wait = Math.min(30, 5 * (retryCount + 1));
    console.warn(`⚠️  MongoDB unavailable (${(lastError || error).message})`);
    console.warn(`   Retrying in ${wait}s… (attempt ${retryCount + 1})`);
    setTimeout(() => connectDB(retryCount + 1), wait * 1000);
  }
}

// Kick off DB connection attempt — server is already listening
connectDB();
