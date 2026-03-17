import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import zhTW from './zh-TW';
import zhCN from './zh-CN';

export const resources = {
  en: { translation: en },
  'zh-TW': { translation: zhTW },
  'zh-CN': { translation: zhCN },
} as const;

export type LanguageCode = keyof typeof resources;
export const LANGUAGES: { code: LanguageCode; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'zh-TW', label: 'Traditional Chinese', nativeLabel: '繁體中文' },
  { code: 'zh-CN', label: 'Simplified Chinese', nativeLabel: '简体中文' },
];

i18n.use(initReactI18next).init({
  resources,
  lng: 'zh-TW',
  fallbackLng: 'en',
  interpolation: {
    // React Native has no DOM, so HTML-based XSS is not applicable here.
    // escapeValue is set to false to allow emoji and special characters in translations.
    escapeValue: false,
  },
});

export default i18n;
