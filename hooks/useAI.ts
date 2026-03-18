import { useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { createAIProvider } from '../services/ai';
import type { AIProvider } from '../services/ai/AIProvider';

export function useAI(): AIProvider {
  const { settings } = useAppStore();

  const provider = useMemo(() => {
    return createAIProvider({
      provider: settings.aiProvider,
      apiKey: settings.aiApiKey || undefined,
      apiSecret: settings.aiApiSecret || undefined,
      model: settings.aiModel || undefined,
    });
  }, [settings.aiProvider, settings.aiApiKey, settings.aiApiSecret, settings.aiModel]);

  return provider;
}
