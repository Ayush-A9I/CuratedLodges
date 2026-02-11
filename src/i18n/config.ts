import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';
import frTranslations from './locales/fr.json';
import deTranslations from './locales/de.json';
import itTranslations from './locales/it.json';
import ptTranslations from './locales/pt.json';
import jaTranslations from './locales/ja.json';
import zhTranslations from './locales/zh.json';
import hiTranslations from './locales/hi.json';

const resources = {
  'en': { translation: enTranslations },
  'en-GB': { translation: enTranslations },
  'es': { translation: esTranslations },
  'es-MX': { translation: esTranslations },
  'fr': { translation: frTranslations },
  'de': { translation: deTranslations },
  'it': { translation: itTranslations },
  'pt': { translation: ptTranslations },
  'pt-BR': { translation: ptTranslations },
  'ja': { translation: jaTranslations },
  'zh': { translation: zhTranslations },
  'hi': { translation: hiTranslations },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
