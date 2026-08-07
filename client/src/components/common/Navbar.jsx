/**
 * Navbar - With Logo, Icons, and Proper Responsiveness
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

  // ✅ Parliament is visible to ALL logged-in users
  const navItems = user ? [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/policies', label: 'Policies' },
    { path: '/parliament', label: 'Parliament' }, // ✅ Everyone can see
    ...(user.role === 'citizen' ? [{ path: '/report', label: 'Report' }] : []),
    ...(user.role === 'officer' ? [{ path: '/upload', label: 'Upload' }] : []),
  ] : [
    { path: '/', label: 'Home' },
    { path: '/policies', label: 'Policies' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-bodhi-navy rounded-lg flex items-center justify-center">
              <span className="text-white font-serif text-lg">स</span>
            </div>
            <span className="text-xl font-serif text-bodhi-navy hidden sm:block">Sambandha</span>
            <span className="text-sm font-serif text-bodhi-navy sm:hidden">S</span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm transition-colors whitespace-nowrap ${
                  isActive(item.path) ? 'text-bodhi-navy font-semibold border-b-2 border-sambandh-brass' : 'text-gray-500 hover:text-bodhi-navy'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <LanguageToggle />
            {user ? (
              <div className="flex items-center gap-3 lg:gap-4">
                <span className="text-sm text-gray-600 hidden lg:inline">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-bodhi-navy transition whitespace-nowrap"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-gray-500 hover:text-bodhi-navy transition whitespace-nowrap">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-bodhi-navy text-white px-4 py-2 rounded-lg hover:bg-bodhi-navy-deep transition whitespace-nowrap"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button - Right */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-bodhi-navy text-xl"
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu - Full width dropdown */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2.5 rounded-lg text-sm ${
                  isActive(item.path) ? 'bg-gray-50 text-bodhi-navy font-semibold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
              <div className="px-3 py-2">
                <LanguageToggle />
              </div>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Logout
                </button>
              ) : (
                <div className="space-y-2 px-3">
                  <Link
                    to="/login"
                    className="block w-full text-center px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center px-3 py-2.5 text-sm bg-bodhi-navy text-white rounded-lg"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;