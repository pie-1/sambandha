/**
 * Register Page - Role-Specific Placeholders
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await register(formData);
    setLoading(false);
    
    if (result.success) {
      toast.success('Registration successful!');
      navigate('/dashboard');
    } else {
      toast.error('Registration failed. Please try again.');
    }
  };

  // Role-specific placeholders
  const getRolePlaceholders = () => {
    switch(formData.role) {
      case 'officer':
        return {
          namePlaceholder: 'e.g., Ram Sharma',
          emailPlaceholder: 'e.g., ram.sharma@mohp.gov.np',
          phonePlaceholder: 'Official contact number',
        };
      case 'expert':
        return {
          namePlaceholder: 'e.g., Dr. Krishna Poudel',
          emailPlaceholder: 'e.g., krishna.poudel@nast.gov.np',
          phonePlaceholder: 'e.g., 9812345678',
        };
      default: // citizen
        return {
          namePlaceholder: 'e.g., Bishnu Ghimire',
          emailPlaceholder: 'e.g., bishnu.ghimire@gmail.com',
          phonePlaceholder: 'e.g., 9841234567',
        };
    }
  };

  const placeholders = getRolePlaceholders();

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-bodhi-navy rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-serif text-xl">स</span>
          </div>
          <h1 className="text-2xl font-serif text-bodhi-navy">Sambandha</h1>
          <p className="text-gray-500 text-sm mt-1">Create your account</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass"
              value={formData.name}
              onChange={handleChange}
              placeholder={placeholders.namePlaceholder}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass"
              value={formData.email}
              onChange={handleChange}
              placeholder={placeholders.emailPlaceholder}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              name="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              name="role"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="citizen">Citizen</option>
              <option value="expert">Expert</option>
              <option value="officer">Government Officer</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {formData.role === 'citizen' && 'Citizens can view and vote on finalized policies'}
              {formData.role === 'expert' && 'Experts need verification after registration'}
              {formData.role === 'officer' && 'Government officers can create and manage policy drafts'}
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number {formData.role === 'citizen' && '*'}
            </label>
            <input
              type="text"
              name="phone"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass"
              value={formData.phone}
              onChange={handleChange}
              placeholder={placeholders.phonePlaceholder}
            />
            {formData.role === 'citizen' && (
              <p className="text-xs text-gray-400 mt-1">Phone number is required for citizens</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full py-3 bg-bodhi-navy text-white rounded-lg font-semibold hover:bg-bodhi-navy-deep transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        
        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-sambandh-brass hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;