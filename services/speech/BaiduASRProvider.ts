import { SpeechProvider, SpeechProviderType, SpeechConfig, SpeechResult } from './SpeechProvider';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Baidu ASR (Automatic Speech Recognition) provider.
 * Works in China without VPN. Free tier: 50,000 requests/month.
 * Supports Mandarin (zh-CN, zh-TW), English.
 * API docs: https://cloud.baidu.com/doc/SPEECH/index.html
 */
export class BaiduASRProvider implements SpeechProvider {
  readonly type: SpeechProviderType = 'baidu';
  readonly name = 'Baidu ASR (百度语音)';
  readonly isAvailableInChina = true;

  private config: SpeechConfig;
  private accessToken?: string;
  private tokenExpiry?: number;

  constructor(config: SpeechConfig) {
    this.config = config;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch(
      `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.config.apiKey}&client_secret=${this.config.apiSecret}`,
      { method: 'POST' }
    );

    const data = await response.json() as { access_token: string; expires_in: number };
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  private getLanguageCode(language: string): number {
    // Baidu language codes
    if (language.includes('zh')) return 1537; // Mandarin
    return 1737; // English
  }

  async recognize(audioUri: string, language: string): Promise<SpeechResult> {
    if (!this.config.apiKey || !this.config.apiSecret) {
      return { text: '', confidence: 0 };
    }

    try {
      const token = await this.getAccessToken();
      const audioData = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await fetch('https://vop.baidu.com/server_api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'pcm',
          rate: 16000,
          channel: 1,
          cuid: 'speak-again-app',
          token,
          speech: audioData,
          len: audioData.length,
          dev_pid: this.getLanguageCode(language),
        }),
      });

      const data = await response.json() as { result?: string[]; err_no: number };
      if (data.result && data.result.length > 0) {
        return { text: data.result[0], confidence: 0.9, alternatives: data.result };
      }
      return { text: '', confidence: 0 };
    } catch {
      return { text: '', confidence: 0 };
    }
  }
}
