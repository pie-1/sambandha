/**
 * Register Page
 * With proper error handling and validation
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
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.role === 'citizen' && (!formData.phone || formData.phone.length < 10)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    
    try {
      const result = await register(formData);
      
      if (result.success) {
        toast.success('Registration successful! Welcome to Sambandh! 🎉');
        navigate('/dashboard');
      } else {
        // Handle validation errors from backend
        if (result.error?.includes('validation')) {
          toast.error('Please check your form fields');
        } else {
          toast.error(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="card">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-serif text-bodhi-navy">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">Join Sambandh and be part of Nepal's policy-making</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label className="label">Full Name *</label>
            <input
              type="text"
              name="name"
              className={`input-field ${errors.name ? 'border-red-500' : ''}`}
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          
          {/* Email */}
          <div className="mb-4">
            <label className="label">Email Address *</label>
            <input
              type="email"
              name="email"
              className={`input-field ${errors.email ? 'border-red-500' : ''}`}
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          
          {/* Password */}
          <div className="mb-4">
            <label className="label">Password *</label>
            <input
              type="password"
              name="password"
              className={`input-field ${errors.password ? 'border-red-500' : ''}`}
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              required
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          
          {/* Role */}
          <div className="mb-4">
            <label className="label">Role *</label>
            <select
              name="role"
              className="input-field"
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
          
          {/* Phone (required for citizens) */}
          <div className="mb-6">
            <label className="label">
              Phone Number {formData.role === 'citizen' && '*'}
            </label>
            <input
              type="text"
              name="phone"
              className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
              value={formData.phone}
              onChange={handleChange}
              placeholder="98XXXXXXXX"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            {formData.role === 'citizen' && (
              <p className="text-xs text-gray-400 mt-1">Phone number is required for citizens</p>
            )}
          </div>
          
          <button
            type="submit"
            className="btn-primary w-full text-lg py-3"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner-sm"></span>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-bodhi-gold hover:underline font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;