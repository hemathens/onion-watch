import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

// All major Indian languages
export const INDIAN_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', flag: '🇮🇳' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', flag: '🇮🇳' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇮🇳' },
  { code: 'si', name: 'Sindhi', nativeName: 'سنڌي', flag: '🇮🇳' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर', flag: '🇮🇳' },
  { code: 'ko', name: 'Konkani', nativeName: 'कोंकणी', flag: '🇮🇳' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', flag: '🇮🇳' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', flag: '🇮🇳' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', flag: '🇮🇳' }
];

export interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (languageCode: string) => void;
  translate: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(INDIAN_LANGUAGES[0]); // Default to English
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load translations for the current language
  const loadTranslations = async (languageCode: string) => {
    setIsLoading(true);
    try {
      // Dynamic import of translation files
      const translationModule = await import(`@/translations/${languageCode}.ts`);
      setTranslations(translationModule.default || translationModule.translations || {});
    } catch (error) {
      console.warn(`Failed to load translations for ${languageCode}, falling back to English`);
      // Fallback to English if translation file doesn't exist
      if (languageCode !== 'en') {
        try {
          const fallbackModule = await import(`@/translations/en.ts`);
          setTranslations(fallbackModule.default || fallbackModule.translations || {});
        } catch (fallbackError) {
          console.error('Failed to load fallback translations:', fallbackError);
          setTranslations({});
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize language from localStorage or default to English
  useEffect(() => {
    const savedLanguageCode = localStorage.getItem('onionwatch-language') || 'en';
    const savedLanguage = INDIAN_LANGUAGES.find(lang => lang.code === savedLanguageCode) || INDIAN_LANGUAGES[0];
    setCurrentLanguage(savedLanguage);
    loadTranslations(savedLanguage.code);
  }, []);

  const setLanguage = (languageCode: string) => {
    const language = INDIAN_LANGUAGES.find(lang => lang.code === languageCode);
    if (language) {
      setCurrentLanguage(language);
      localStorage.setItem('onionwatch-language', languageCode);
      loadTranslations(languageCode);
    }
  };

  const translate = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[key] || key;
    
    // Replace parameters in the translation
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
      });
    }
    
    return translation;
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    translate,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};