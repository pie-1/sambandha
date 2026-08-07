/**
 * Footer - Clean, Professional
 */

import React from 'react';
import { Link } from 'react-router-dom';
import LanguageToggle from './LanguageToggle';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bodhi-navy text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-serif text-sambandh-brass-light">Sambandha</h3>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              A policy co-creation platform for Nepal
            </p>
          </div>

          <div>
            <h4 className="font-medium text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-sambandh-brass-light transition">Home</Link></li>
              <li><Link to="/policies" className="hover:text-sambandh-brass-light transition">Policies</Link></li>
              <li><Link to="/dashboard" className="hover:text-sambandh-brass-light transition">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white mb-3">Features</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Policy Drafting</li>
              <li>Expert Review</li>
              <li>Public Voting</li>
              <li>Implementation Tracking</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white mb-3">Connect</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>info@sambandha.gov.np</p>
              <p>Kathmandu, Nepal</p>
              <div className="mt-3">
                <LanguageToggle />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-sm text-gray-400 text-center">
          <p>© {currentYear} Sambandha. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;