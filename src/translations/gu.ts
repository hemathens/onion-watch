// Gujarati translations (fallback to English for now)
import { translations as englishTranslations } from './en';

export const translations = {
  ...englishTranslations,
  // Override with Gujarati translations when available
  'nav.language': 'ભાષા',
  'nav.dashboard': 'ડેશબોર્ડ',
  'nav.inventory': 'ઇન્વેન્ટરી',
  'nav.settings': 'સેટિંગ્સ'
};

export default translations;