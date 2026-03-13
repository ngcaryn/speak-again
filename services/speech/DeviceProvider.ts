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
    // Device-level speech recognition is handled by the Audio Recording hook
    // This provider serves as a fallback indicator
    return {
      text: '',
      confidence: 0,
      alternatives: [],
    };
  }
}
