/**
 * Footer Component - Shared across all pages
 */

import { Link } from 'react-router-dom';
import LanguageToggle from './LanguageToggle';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Policies', path: '/policies' },
    { name: 'Project Tracking', path: '/tracking' },
    { name: 'Dashboard', path: '/dashboard' },
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
              A collaborative policy co-creation platform for Nepal&apos;s sustainable development.
            </p>
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
              <li className="text-gray-400 text-sm">Policy Drafting</li>
              <li className="text-gray-400 text-sm">Expert Review</li>
              <li className="text-gray-400 text-sm">Public Voting</li>
              <li>
                <Link to="/simulator" className="text-gray-400 hover:text-bodhi-gold transition-colors text-sm">
                  Policy Simulation Lab
                </Link>
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
            </p>
            <span className="text-xs px-2 py-1 rounded bg-bodhi-gold/20 text-bodhi-gold-light">
              🇳🇵 Made in Nepal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
