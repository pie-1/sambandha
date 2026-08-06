/**
 * Navbar Component
 * Complete navigation with proper links
 */

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Check if link is active
  const isActive = (path) => {
    return location.pathname === path ? 'text-bodhi-gold' : 'hover:text-bodhi-gold';
  };

  return (
    <nav className="bg-bodhi-navy text-white shadow-lg sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Always visible */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-serif text-bodhi-gold">Sambandh</span>
            <span className="text-xs text-bodhi-gold-light">नेपाल</span>
          </Link>

          {/* Navigation Links - Center */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={`text-sm transition ${isActive('/')}`}>
              Home
            </Link>
            <Link to="/policies" className={`text-sm transition ${isActive('/policies')}`}>
              Policies
            </Link>
            {user && (
              <Link to="/dashboard" className={`text-sm transition ${isActive('/dashboard')}`}>
                Dashboard
              </Link>
            )}
            {user?.role === 'officer' && (
              <>
                <Link to="/upload" className={`text-sm transition ${isActive('/upload')}`}>
                  Upload
                </Link>
                <Link to="/simulator" className={`text-sm transition ${isActive('/simulator')}`}>
                  Simulator
                </Link>
              </>
            )}
            {user?.role === 'citizen' && (
              <Link to="/feedback" className={`text-sm transition ${isActive('/feedback')}`}>
                Feedback
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <LanguageToggle />

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-bodhi-gold-light hidden md:inline">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-primary text-sm px-4 py-1.5"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm hover:text-bodhi-gold transition">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-1.5">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu - Bottom Bar */}
        <div className="md:hidden flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <Link to="/" className={`text-xs transition ${isActive('/')}`}>
            Home
          </Link>
          <Link to="/policies" className={`text-xs transition ${isActive('/policies')}`}>
            Policies
          </Link>
          {user && (
            <Link to="/dashboard" className={`text-xs transition ${isActive('/dashboard')}`}>
              Dashboard
            </Link>
          )}
          {user?.role === 'officer' && (
            <>
              <Link to="/upload" className={`text-xs transition ${isActive('/upload')}`}>
                Upload
              </Link>
              <Link to="/simulator" className={`text-xs transition ${isActive('/simulator')}`}>
                Simulator
              </Link>
            </>
          )}
          {user?.role === 'citizen' && (
            <Link to="/feedback" className={`text-xs transition ${isActive('/feedback')}`}>
              Feedback
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;