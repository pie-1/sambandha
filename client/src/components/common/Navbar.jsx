/**
 * Navbar - With Logo and Icons (No Predict)
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LanguageToggle from './LanguageToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = user ? [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/policies', label: 'Policies' },
    ...(user.role === 'citizen' ? [{ path: '/report', label: 'Report' }] : []),
    ...(user.role === 'officer' || user.role === 'expert' ? [{ path: '/parliament', label: 'Parliament' }] : []),
    ...(user.role === 'officer' ? [{ path: '/upload', label: 'Upload' }] : []),
  ] : [
    { path: '/', label: 'Home' },
    { path: '/policies', label: 'Policies' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo with Icon */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-bodhi-navy rounded-lg flex items-center justify-center">
              <span className="text-white font-serif text-lg">स</span>
            </div>
            <span className="text-xl font-serif text-bodhi-navy">Sambandha</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm transition-colors ${
                  isActive(item.path) ? 'text-bodhi-navy font-semibold' : 'text-gray-500 hover:text-bodhi-navy'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageToggle />
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-bodhi-navy transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm text-gray-500 hover:text-bodhi-navy transition">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-bodhi-navy text-white px-4 py-2 rounded-lg hover:bg-bodhi-navy-deep transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-bodhi-navy text-xl"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-gray-100 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-lg text-sm ${
                  isActive(item.path) ? 'bg-gray-50 text-bodhi-navy font-semibold' : 'text-gray-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <LanguageToggle />
              {user ? (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-sm bg-bodhi-navy text-white rounded-lg text-center"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;