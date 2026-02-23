import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authenticationMiddleware from './middlewares/authenticationMiddleware.js';
import authenticationRoutes from './routes/authenticationRoutes.js';
import stockRoutes from './routes/stockRoutes.js';

dotenv.config();
const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: false,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/auth', authenticationRoutes);
app.use('/api/stocks', authenticationMiddleware, stockRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        message: "invezt backend is running",
        status: "ok",
    });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
    try {
        if (!process.env.MONGO_URI){
            console.warn("MONGO_URI is not in env. database will not connect");
        } else {
            await mongoose.connect(process.env.MONGO_URI);
            console.log("mongoDB connected");
        }

        app.listen(PORT, () => {
          console.log(`server runnning on http://localhost:${PORT}`);
});
    } catch(err){
        console.error("failed to start server: ", err.message);
        process.exit(1);
    }
};

startServer();
