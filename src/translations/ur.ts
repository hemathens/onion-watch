// Urdu translations (fallback to English for now)
import { translations as englishTranslations } from './en';

export const translations = {
  ...englishTranslations,
  // Override with Urdu translations when available
  'nav.language': 'زبان',
  'nav.dashboard': 'ڈیش بورڈ',
  'nav.inventory': 'انوینٹری',
  'nav.settings': 'سیٹنگز'
};

export default translations;