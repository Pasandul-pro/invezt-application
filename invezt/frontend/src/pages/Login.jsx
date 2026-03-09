import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-light flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Invezt</h1>
          <p className="text-gray-600 mt-2">Investing Made Simple</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full mb-3">
            Log In
          </button>
          
          <Link to="/dashboard" className="btn bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white w-full block text-center">
            Sign Up
          </Link>

          <div className="text-center mt-6">
            <a href="#" className="text-primary hover:underline text-sm">Forgot password?</a>
          </div>
        </form>

        <div className="text-center mt-8">
          <Link to="/" className="text-gray-600 hover:text-primary transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;