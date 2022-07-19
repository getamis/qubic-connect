import i18n, { LanguageDetectorAsyncModule } from 'i18next';
import { initReactI18next } from 'react-i18next';

import zhTw from '../locales/zh-TW.json';
import en from '../locales/en.json';
import { STORAGE_KEYS } from '../constants/storage';

export const resources = {
  en: {
    translation: en,
  },
  'zh-TW': {
    translation: zhTw,
  },
} as const;

const validLocales = Object.keys(resources);

export type I18nKey = keyof typeof en;

export type LocaleType = keyof typeof resources;

export function getLocale(): LocaleType | null {
  const result = localStorage.getItem(STORAGE_KEYS.LOCALE) as LocaleType | null;

  return result as LocaleType | null;
}

export function saveLocale(locale: LocaleType | null): void {
  if (!locale || !validLocales.includes(locale)) {
    return;
  }

  i18n.changeLanguage(locale);
  localStorage.setItem(STORAGE_KEYS.LOCALE, locale);
}

/* eslint-disable @typescript-eslint/no-empty-function */
const languageDetector: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  detect: async callback => {
    const savedLocale = await getLocale();

    if (savedLocale) {
      callback(savedLocale);
      return;
    }

    const { languages } = navigator;

    const fittingLanguage = (languages.find(lan => validLocales.includes(lan)) || 'en') as LocaleType;

    saveLocale(fittingLanguage);
    callback(fittingLanguage);
  },
  init: () => {},
  cacheUserLanguage: () => {},
};
/* eslint-enable @typescript-eslint/no-empty-function */

i18n
  .use(languageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng: {
      // for ios start
      'zh-Hant': ['zh-TW', 'en'],
      'zh-Hans': ['zh-TW', 'en'],
      // for ios end
      default: ['en'],
    },
    resources,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
