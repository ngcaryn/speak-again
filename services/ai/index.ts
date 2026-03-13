import { AIConfig, AIProvider, AIProviderType } from './AIProvider';
import { BaiduProvider } from './BaiduProvider';
import { TongyiProvider } from './TongyiProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { LocalProvider } from './LocalProvider';

export { AIConfig, AIProvider, AIProviderType };
export type { SpeechFeedback, AIResponse } from './AIProvider';

export function createAIProvider(config: AIConfig): AIProvider {
  switch (config.provider) {
    case 'baidu':
      return new BaiduProvider(config);
    case 'tongyi':
      return new TongyiProvider(config);
    case 'openai':
      return new OpenAIProvider(config);
    case 'local':
    default:
      return new LocalProvider();
  }
}

export { BaiduProvider, TongyiProvider, OpenAIProvider, LocalProvider };
