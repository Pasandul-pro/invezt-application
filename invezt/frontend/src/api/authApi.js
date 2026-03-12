import apiClient from './apiClient.js';

/**
 * Register a new user
 * @param {string} username
 * @param {string} email
 * @param {string} password
 */
export const register = async (username, email, password) => {
  const res = await apiClient.post('/auth/register', { username, email, password });
  return res.data;
};

/**
 * Login with email + password
 * Returns { _id, username, email, token }
 */
export const login = async (email, password) => {
  const res = await apiClient.post('/auth/login', { email, password });
  return res.data;
};

/**
 * Get the currently logged-in user profile (requires token)
 */
export const getProfile = async () => {
  const res = await apiClient.get('/auth/me');
  return res.data;
};
