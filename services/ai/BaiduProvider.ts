import { BaseAIProvider, AIProviderType, AIConfig, AIResponse } from './AIProvider';

/**
 * Baidu Wenxin (ERNIE Bot) provider - works in China without VPN.
 * API docs: https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html
 * Free tier: 50M tokens/month for ERNIE-Lite
 * Upgrade path: ERNIE-Bot 4.0 when funded
 */
export class BaiduProvider extends BaseAIProvider {
  readonly type: AIProviderType = 'baidu';
  readonly name = 'Baidu ERNIE (百度文心)';
  readonly isAvailableInChina = true;

  private config: AIConfig;
  private accessToken?: string;
  private tokenExpiry?: number;

  // Configurable model - start with free ERNIE-Lite, upgrade to ERNIE-Bot-4 when funded
  private static readonly MODELS = {
    free: 'ernie-lite-8k',           // Free tier
    standard: 'ernie_speed',          // Low cost
    premium: 'ernie-4.0-8k',         // Premium (paid)
  };

  constructor(config: AIConfig) {
    super();
    this.config = config;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('Baidu API key and secret are required');
    }

    const response = await fetch(
      `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.config.apiKey}&client_secret=${this.config.apiSecret}`,
      { method: 'POST' }
    );

    if (!response.ok) {
      throw new Error(`Baidu auth failed: ${response.statusText}`);
    }

    const data = await response.json() as { access_token: string; expires_in: number };
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  async chat(message: string, context?: string): Promise<AIResponse> {
    if (!this.config.apiKey) {
      return this.offlineFallback(message);
    }

    try {
      const token = await this.getAccessToken();
      const model = this.config.model || BaiduProvider.MODELS.free;

      const systemPrompt = context || `You are a compassionate speech therapy assistant helping stroke patients practice communication. 
      Respond in a warm, encouraging, simple language. Keep responses short and clear.
      The patient may have aphasia and difficulty expressing themselves.`;

      const response = await fetch(
        `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${model}?access_token=${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: message }],
            system: systemPrompt,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Baidu API error: ${response.statusText}`);
      }

      const data = await response.json() as { result: string };
      return { text: data.result };
    } catch {
      return this.offlineFallback(message);
    }
  }

  private offlineFallback(_message: string): AIResponse {
    return {
      text: 'AI service temporarily unavailable. Using offline mode.',
      suggestions: ['Check your internet connection', 'Verify your API key in Settings'],
    };
  }
}
