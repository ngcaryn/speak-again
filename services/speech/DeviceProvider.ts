import { SpeechProvider, SpeechProviderType, SpeechResult } from './SpeechProvider';

/**
 * Device built-in speech recognition using Expo Speech.
 * Uses the device's native speech recognition - available on both iOS and Android.
 * No API key needed. Works offline for basic recognition.
 * Limited by device OS capabilities.
 */
export class DeviceProvider implements SpeechProvider {
  readonly type: SpeechProviderType = 'device';
  readonly name = 'Device Built-in';
  readonly isAvailableInChina = true;

  async recognize(_audioUri: string, _language: string): Promise<SpeechResult> {
    // Device speech recognition is driven by the UI layer using Expo's Voice APIs.
    // Returning empty results here signals the caller to use the native recognition flow.
    return {
      text: '',
      confidence: 0,
      alternatives: [],
    };
  }
}
