// Sanskrit translations (fallback to English for now)
import { translations as englishTranslations } from './en';

export const translations = {
  ...englishTranslations,
  'nav.language': 'भाषा',
  'nav.dashboard': 'डेशबोर्ड',
  'nav.inventory': 'सूची',
  'nav.settings': 'व्यवस्था'
};

export default translations;