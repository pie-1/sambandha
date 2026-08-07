/**
 * Login Page
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-bodhi-navy rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-serif text-xl">स</span>
          </div>
          <h1 className="text-2xl font-serif text-bodhi-navy">Sambandha</h1>
          <p className="text-gray-500 text-sm mt-1">Policy Co-Creation Platform</p>
        </div>
        
        <h2 className="text-xl font-semibold text-bodhi-navy text-center mb-6">
          Sign In
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 bg-bodhi-navy text-white rounded-lg font-semibold hover:bg-bodhi-navy-deep transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-sambandh-brass hover:underline">
            Register
          </Link>
        </p>

        {/* Demo Credentials */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center mb-3">Demo Credentials</p>
          <div className="space-y-1 text-xs text-gray-500">
            <p><span className="font-medium">Officer:</span> ram.sharma@mohp.gov.np / password123</p>
            <p><span className="font-medium">Expert:</span> krishna.poudel@nast.gov.np / password123</p>
            <p><span className="font-medium">Citizen:</span> bishnu.ghimire@gmail.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;