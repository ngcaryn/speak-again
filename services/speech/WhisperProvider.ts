import { SpeechProvider, SpeechProviderType, SpeechResult } from './SpeechProvider';

/**
 * Whisper ASR provider placeholder.
 * Future integration with OpenAI Whisper API or local whisper.cpp model.
 * Works outside China (requires VPN in China).
 */
export class WhisperProvider implements SpeechProvider {
  readonly type: SpeechProviderType = 'whisper';
  readonly name = 'Whisper AI';
  readonly isAvailableInChina = false;

  async recognize(_audioUri: string, _language: string): Promise<SpeechResult> {
    // TODO: Integrate OpenAI Whisper API or local whisper.cpp when funded
    // POST audioUri to https://api.openai.com/v1/audio/transcriptions
    return {
      text: '',
      confidence: 0,
      alternatives: [],
    };
  }
}
