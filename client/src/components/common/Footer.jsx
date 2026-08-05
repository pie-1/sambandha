/**
 * Footer Component - Shared across all pages
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Policies', path: '/policies' },
    { name: 'About', path: '/about' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: '📘', url: '#' },
    { name: 'Twitter', icon: '🐦', url: '#' },
    { name: 'LinkedIn', icon: '💼', url: '#' },
    { name: 'YouTube', icon: '▶️', url: '#' },
  ];

  return (
    <footer className="bg-bodhi-navy-deep text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="text-3xl font-serif text-bodhi-gold">Sambandh</span>
              <span className="text-xs text-bodhi-gold-light">नेपाल</span>
            </Link>
            <p className="text-gray-400 text-sm mt-4 leading-relaxed">
              A collaborative policy co-creation platform for Nepal's sustainable development.
            </p>
            <div className="flex gap-3 mt-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-bodhi-gold transition-all duration-200 flex items-center justify-center text-lg hover:scale-110"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-serif text-bodhi-gold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-bodhi-gold transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-serif text-bodhi-gold mb-4">Features</h4>
            <ul className="space-y-3">
              <li className="text-gray-400 text-sm hover:text-bodhi-gold transition-colors cursor-pointer">
                Policy Drafting
              </li>
              <li className="text-gray-400 text-sm hover:text-bodhi-gold transition-colors cursor-pointer">
                Expert Review
              </li>
              <li className="text-gray-400 text-sm hover:text-bodhi-gold transition-colors cursor-pointer">
                Public Voting
              </li>
              <li className="text-gray-400 text-sm hover:text-bodhi-gold transition-colors cursor-pointer">
                Impact Simulation
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-lg font-serif text-bodhi-gold mb-4">Connect</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">📧</span>
                <a href="mailto:info@sambandh.gov.np" className="text-gray-400 hover:text-bodhi-gold transition-colors text-sm">
                  info@sambandh.gov.np
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">📞</span>
                <span className="text-gray-400 text-sm">+977-1-1234567</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">📍</span>
                <span className="text-gray-400 text-sm">Kathmandu, Nepal</span>
              </div>
              <div className="mt-4">
                <LanguageToggle />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} Sambandh. All rights reserved. 
              <span className="hidden md:inline"> Made with ❤️ for Nepal</span>
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-bodhi-gold transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-bodhi-gold transition-colors">
                Terms of Service
              </Link>
              <span className="text-xs px-2 py-1 rounded bg-bodhi-gold/20 text-bodhi-gold-light">
                🇳🇵 Made in Nepal
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;