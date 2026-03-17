import { BaseAIProvider, AIProviderType, AIConfig, AIResponse } from './AIProvider';

/**
 * OpenAI provider - works outside China (requires VPN in China).
 * Supports GPT-4o-mini (free tier via API), upgradeable to GPT-4o.
 * Note: Not accessible in China without VPN. Use Baidu/Tongyi for China.
 */
export class OpenAIProvider extends BaseAIProvider {
  readonly type: AIProviderType = 'openai';
  readonly name = 'OpenAI GPT';
  readonly isAvailableInChina = false;

  private config: AIConfig;

  // Configurable model upgrade path
  private static readonly MODELS = {
    free: 'gpt-4o-mini',    // Cheapest
    standard: 'gpt-4o',     // Standard
    premium: 'gpt-4',       // Premium
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
      const model = this.config.model || OpenAIProvider.MODELS.free;
      const baseUrl = this.config.baseUrl || 'https://api.openai.com/v1';
      const systemPrompt = context || `You are a compassionate speech therapy assistant helping stroke patients practice communication.
      Respond in a warm, encouraging, simple language. Keep responses short and clear.
      The patient may have aphasia and difficulty expressing themselves.`;

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json() as {
        choices: Array<{ message: { content: string } }>
      };
      return { text: data.choices[0].message.content };
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
