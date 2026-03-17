import { BaseAIProvider, AIProviderType, AIConfig, AIResponse } from './AIProvider';

/**
 * Alibaba Tongyi Qianwen provider - works in China without VPN.
 * API docs: https://help.aliyun.com/zh/dashscope/
 * Free tier: qwen-turbo free quota for new users
 * Upgrade path: qwen-max when funded
 */
export class TongyiProvider extends BaseAIProvider {
  readonly type: AIProviderType = 'tongyi';
  readonly name = 'Alibaba Tongyi (阿里通义)';
  readonly isAvailableInChina = true;

  private config: AIConfig;

  // Configurable model - free to premium upgrade path
  private static readonly MODELS = {
    free: 'qwen-turbo',      // Low cost/free quota
    standard: 'qwen-plus',   // Standard
    premium: 'qwen-max',     // Premium (paid)
  };

  constructor(config: AIConfig) {
    super();
    this.config = config;
  }

  async chat(message: string, context?: string): Promise<AIResponse> {
    if (!this.config.apiKey) {
      return this.offlineFallback(message);
    }

    try {
      const model = this.config.model || TongyiProvider.MODELS.free;
      const systemPrompt = context || `You are a compassionate speech therapy assistant helping stroke patients practice communication.
      Respond in a warm, encouraging, simple language. Keep responses short and clear.`;

      const response = await fetch(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model,
            input: {
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message },
              ],
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Tongyi API error: ${response.statusText}`);
      }

      const data = await response.json() as {
        output: { choices: Array<{ message: { content: string } }> }
      };
      return { text: data.output.choices[0].message.content };
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
