import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { errorHandler } from './middleware/error.middleware.js';
import routes from './routes/index.js';

dotenv.config();

