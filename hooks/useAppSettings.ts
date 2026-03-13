import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';

export function useAppSettings() {
  const { settings, updateSettings, isLoaded } = useAppStore();
  const { i18n: i18nInstance } = useTranslation();

  useEffect(() => {
    if (isLoaded && settings.language) {
      i18nInstance.changeLanguage(settings.language);
    }
  }, [settings.language, isLoaded]);

  const changeLanguage = async (language: string) => {
    await updateSettings({ language: language as Parameters<typeof updateSettings>[0]['language'] });
    await i18nInstance.changeLanguage(language);
  };

  return {
    settings,
    updateSettings,
    changeLanguage,
    isLoaded,
  };
}
