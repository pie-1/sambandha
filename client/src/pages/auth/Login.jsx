/**
 * Login Page
 */

import { useState } from 'react';
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
      <div className="card">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-serif text-bodhi-navy">Sambandh</h1>
          <p className="text-bodhi-gold text-sm">Policy Co-Creation Platform</p>
        </div>
        
        <h2 className="text-2xl font-serif text-bodhi-navy text-center mb-6">
          {t('auth.login')}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="label">{t('auth.email')}</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="label">{t('auth.password')}</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Loading...' : t('auth.login')}
          </button>
        </form>
        
        <p className="text-center mt-4 text-sm text-gray-600">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-bodhi-gold hover:underline">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;