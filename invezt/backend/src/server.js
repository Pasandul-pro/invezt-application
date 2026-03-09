import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authenticationMiddleware from './middlewares/authenticationMiddleware.js';
import authenticationRoutes from './routes/authenticationRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import valuationRoutes from './routes/valuationRoutes.js'; // NEW: Import valuation routes

dotenv.config();
const app = express();

app.use(cors({
    origin: process.env.frontend_url || "*",
    credentials: false,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Routes
app.use('/api/auth', authenticationRoutes);
app.use('/api/stocks', authenticationMiddleware, stockRoutes);
app.use('/api/valuation', authenticationMiddleware, valuationRoutes); // NEW: Valuation routes with auth

// Health check
app.get('/', (req, res) => {
    res.status(200).json({
        message: "invezt backend is running",
        status: "ok",
        endpoints: {
            auth: "/api/auth",
            stocks: "/api/stocks",
            valuation: "/api/valuation" // NEW: Added to health check
        }
    });
});

const port = process.env.port || 5001;

const startServer = async () => {
    try {
        if (!process.env.db_url){
            console.warn("db_url is not in env. database will not connect");
        } else {
            await mongoose.connect(process.env.db_url);
            console.log("mongoDB connected");
        }

        app.listen(port, () => {
          console.log(`server runnning on http://localhost:${port}`);
          console.log(`📊 Valuation API: http://localhost:${port}/api/valuation`);
        });
    } catch(err){
        console.error("failed to start server: ", err.message);
        process.exit(1);
    }
};

startServer();