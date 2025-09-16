// Marathi translations (fallback to English for now)
import { translations as englishTranslations } from './en';

export const translations = {
  ...englishTranslations,
  // Override with Marathi translations when available
  'nav.language': 'भाषा',
  'nav.dashboard': 'डॅशबोर्ड',
  'nav.inventory': 'यादी',
  'nav.settings': 'सेटिंग्ज'
};

export default translations;