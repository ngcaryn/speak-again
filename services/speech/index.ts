import { SpeechConfig, SpeechProvider, SpeechProviderType } from './SpeechProvider';
import { BaiduASRProvider } from './BaiduASRProvider';
import { DeviceProvider } from './DeviceProvider';
import { WhisperProvider } from './WhisperProvider';

export { SpeechConfig, SpeechProvider, SpeechProviderType };
export type { SpeechResult } from './SpeechProvider';

export function createSpeechProvider(config: SpeechConfig): SpeechProvider {
  switch (config.provider) {
    case 'baidu':
      return new BaiduASRProvider(config);
    case 'whisper':
      return new WhisperProvider();
    case 'device':
    default:
      return new DeviceProvider();
  }
}
