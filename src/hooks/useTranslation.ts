import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Translation hook for easy use in components
 */
export const useTranslation = () => {
  const { translate, currentLanguage, isLoading } = useLanguage();

  // Short alias for translate function
  const t = (key: string, params?: Record<string, string | number>) => {
    return translate(key, params);
  };

  return {
    t,
    translate,
    currentLanguage,
    isLoading
  };
};