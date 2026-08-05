/**
 * Language Toggle Component
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ne' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
    document.documentElement.className = `lang-${newLang}`;
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1 rounded-lg bg-bodhi-gold/20 hover:bg-bodhi-gold/30 transition text-sm font-medium"
    >
      {i18n.language === 'en' ? '🇳🇵 नेपाली' : '🇬🇧 English'}
    </button>
  );
};

export default LanguageToggle;