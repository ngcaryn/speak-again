export type AIProviderType = 'baidu' | 'tongyi' | 'openai' | 'local';

export interface AIConfig {
  provider: AIProviderType;
  apiKey?: string;
  apiSecret?: string;
  model?: string;
  baseUrl?: string;
}

export interface AIResponse {
  text: string;
  confidence?: number;
  suggestions?: string[];
}

export interface SpeechFeedback {
  score: number;           // 0-100
  accuracy: string;        // e.g. "85%"
  feedback: string;        // Encouraging feedback text
  suggestions: string[];   // Improvement suggestions
  targetWord?: string;
  spokenWord?: string;
}

export interface AIProvider {
  readonly type: AIProviderType;
  readonly name: string;
  readonly isAvailableInChina: boolean;

  chat(message: string, context?: string): Promise<AIResponse>;
  generateSpeechFeedback(targetText: string, spokenText: string, language: string): Promise<SpeechFeedback>;
  generateCognitiveQuestion(category: string, difficulty: string, language: string): Promise<AIResponse>;
  interpretGesture(description: string, language: string): Promise<AIResponse>;
}

export abstract class BaseAIProvider implements AIProvider {
  abstract readonly type: AIProviderType;
  abstract readonly name: string;
  abstract readonly isAvailableInChina: boolean;

  abstract chat(message: string, context?: string): Promise<AIResponse>;

  async generateSpeechFeedback(targetText: string, spokenText: string, language: string): Promise<SpeechFeedback> {
    const similarity = this.calculateSimilarity(targetText.toLowerCase(), spokenText.toLowerCase());
    const score = Math.round(similarity * 100);

    let feedback: string;
    let suggestions: string[] = [];

    if (score >= 90) {
      feedback = language === 'en' ? 'Excellent! Perfect pronunciation!' :
                 language === 'zh-TW' ? '太棒了！發音非常準確！' : '太棒了！发音非常准确！';
    } else if (score >= 70) {
      feedback = language === 'en' ? 'Good job! Keep practicing!' :
                 language === 'zh-TW' ? '做得好！繼續練習！' : '做得好！继续练习！';
      suggestions = [language === 'en' ? 'Try saying it more slowly' :
                     language === 'zh-TW' ? '試著說慢一點' : '试着说慢一点'];
    } else {
      feedback = language === 'en' ? 'Keep trying! You can do it!' :
                 language === 'zh-TW' ? '繼續努力！你可以的！' : '继续努力！你可以的！';
      suggestions = [
        language === 'en' ? 'Listen to the target word again' :
        language === 'zh-TW' ? '再聽一次目標詞語' : '再听一次目标词语',
        language === 'en' ? 'Try speaking more slowly' :
        language === 'zh-TW' ? '試著說慢一點' : '试着说慢一点',
      ];
    }

    return {
      score,
      accuracy: `${score}%`,
      feedback,
      suggestions,
      targetWord: targetText,
      spokenWord: spokenText,
    };
  }

  async generateCognitiveQuestion(_category: string, _difficulty: string, _language: string): Promise<AIResponse> {
    return { text: `Question about ${_category}` };
  }

  async interpretGesture(_description: string, language: string): Promise<AIResponse> {
    return { text: language === 'en' ? 'I see you need help' :
             language === 'zh-TW' ? '我看到您需要幫助' : '我看到您需要帮助' };
  }

  protected calculateSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;

    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    const longerLength = longer.length;

    if (longerLength === 0) return 1.0;

    return (longerLength - this.editDistance(longer, shorter)) / longerLength;
  }

  private editDistance(s1: string, s2: string): number {
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }
}
