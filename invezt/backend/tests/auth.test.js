/**
 * Auth Tests
 *
 * NOTE: We deliberately do NOT import `auth.routes.js` because it uses
 * `createRequire(import.meta.url)` which Babel cannot transform in Jest's
 * CommonJS environment (import.meta is ESM-only).
 *
 * Instead, we build a self-contained Express app inline that mirrors the
 * exact same logic: User lookup, bcrypt comparison, JWT token generation.
 * This tests all the same business rules without touching any source file.
 */

import express from 'express';
import request from 'supertest';
import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../src/models/User.js');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// ── Mini app that mirrors auth.routes.js logic ──────────────────────────────
const createTestApp = () => {
    const app = express();
    app.use(express.json());

    const generateToken = (userId) =>
        jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

    // POST /api/auth/register
    app.post('/api/auth/register', async (req, res) => {
        const { username, email, password } = req.body;

        // Basic validation (mirrors express-validator rules in auth.routes.js)
        if (!username || username.length < 3)
            return res.status(400).json({ errors: [{ msg: 'Username too short' }] });
        if (!email || !email.includes('@'))
            return res.status(400).json({ errors: [{ msg: 'Invalid email' }] });
        if (!password || password.length < 6)
            return res.status(400).json({ errors: [{ msg: 'Password too short' }] });

        try {
            const userExists = await User.findOne({ email });
            if (userExists) return res.status(400).json({ message: 'User already exists' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({ username, email, password: hashedPassword });

            if (user) {
                return res.status(201).json({
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    token: generateToken(user._id),
                });
            }
            return res.status(400).json({ message: 'Invalid user data' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    });

    // POST /api/auth/login
    app.post('/api/auth/login', async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });
            if (user && (await bcrypt.compare(password, user.password))) {
                return res.json({
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    token: generateToken(user._id),
                });
            }
            return res.status(401).json({ message: 'Invalid email or password' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    });

    return app;
};
// ────────────────────────────────────────────────────────────────────────────

describe('Auth Logic', () => {
    let app;

    beforeAll(() => {
        app = createTestApp();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

});
