import { BaseAIProvider, AIProviderType, AIResponse } from './AIProvider';

export class LocalProvider extends BaseAIProvider {
  readonly type: AIProviderType = 'local';
  readonly name = 'Offline Mode';
  readonly isAvailableInChina = true;

  async chat(message: string, _context?: string): Promise<AIResponse> {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('water') || lowerMsg.includes('水')) {
      return { text: "You need water. I'll let your caregiver know." };
    }
    if (lowerMsg.includes('pain') || lowerMsg.includes('痛')) {
      return { text: "You are in pain. I'll alert your caregiver immediately." };
    }
    if (lowerMsg.includes('help') || lowerMsg.includes('幫') || lowerMsg.includes('帮')) {
      return { text: "You need help. I'll call someone for you." };
    }

    return {
      text: 'I understand. Please use the picture board to help me understand better.',
      suggestions: ['Try the picture board', 'Use gestures'],
    };
  }
}
