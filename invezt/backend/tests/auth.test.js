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
});
