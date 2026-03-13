import { useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { createSpeechProvider } from '../services/speech';
import type { SpeechProvider } from '../services/speech/SpeechProvider';

export function useSpeech(): SpeechProvider {
  const { settings } = useAppStore();

  const provider = useMemo(() => {
    return createSpeechProvider({
      provider: settings.speechProvider,
      apiKey: settings.speechApiKey || undefined,
      apiSecret: settings.speechApiSecret || undefined,
      language: settings.language,
    });
  }, [settings.speechProvider, settings.speechApiKey, settings.speechApiSecret, settings.language]);

  return provider;
}
