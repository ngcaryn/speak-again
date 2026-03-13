/** 'whisper' is reserved for future Whisper API integration */
export type SpeechProviderType = 'baidu' | 'whisper' | 'device';

export interface SpeechConfig {
  provider: SpeechProviderType;
  apiKey?: string;
  apiSecret?: string;
  language?: string;
}

export interface SpeechResult {
  text: string;
  confidence?: number;
  alternatives?: string[];
}

export interface SpeechProvider {
  readonly type: SpeechProviderType;
  readonly name: string;
  readonly isAvailableInChina: boolean;
  recognize(audioUri: string, language: string): Promise<SpeechResult>;
}
