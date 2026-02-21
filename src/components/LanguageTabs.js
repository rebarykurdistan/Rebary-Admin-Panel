'use client';

import { useState } from 'react';

export default function LanguageTabs({ children, defaultLanguage = 'sor' }) {
  const [activeLanguage, setActiveLanguage] = useState(defaultLanguage);

  const languages = [
    { code: 'sor', label: 'Sorani', flag: '🇮🇶' },
    { code: 'bad', label: 'Badini', flag: '🇮🇶' },
    { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <div>
      {/* Language Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setActiveLanguage(lang.code)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all
              ${activeLanguage === lang.code
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {children(activeLanguage)}
      </div>
    </div>
  );
}
