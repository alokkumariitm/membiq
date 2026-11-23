import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Languages } from 'lucide-react';
import '../styles/language-switcher.css';

export const LanguageSwitcher = ({ prominent = false, className = '' }) => {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`lang-switcher ${prominent ? 'prominent' : ''} ${className}`}
      role="group"
      aria-label="Language Selector / भाषा चयन"
    >
      <button
        type="button"
        className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
      >
        <span className="lang-indicator-icon">
          <Languages size={prominent ? 18 : 16} />
        </span>
        English
      </button>

      <button
        type="button"
        className={`lang-btn ${lang === 'hi' ? 'active' : ''}`}
        onClick={() => setLang('hi')}
        aria-pressed={lang === 'hi'}
      >
        हिंदी
      </button>
    </div>
  );
};

export default LanguageSwitcher;
