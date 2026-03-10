import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { errorHandler } from './middleware/error.middleware.js';
import routes from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9003;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

