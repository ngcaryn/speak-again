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
    const normalizedTarget = this.normalizeSpeechText(targetText, language);
    const normalizedSpoken = this.normalizeSpeechText(spokenText, language);
    const similarity = this.calculateSimilarity(normalizedTarget, normalizedSpoken, language);
    const score = Math.round(similarity * 100);

    let feedback: string;
    let suggestions: string[] = [];

    if (!normalizedSpoken) {
      feedback = language === 'en' ? 'I could not hear clear speech. Please try again.' :
                 language === 'zh-TW' ? '我沒有聽清楚，請再試一次。' : '我没有听清楚，请再试一次。';
      suggestions = [
        language === 'en' ? 'Speak closer to the microphone' :
        language === 'zh-TW' ? '請靠近麥克風說話' : '请靠近麦克风说话',
        language === 'en' ? 'Use a quiet environment' :
        language === 'zh-TW' ? '請在安靜環境中練習' : '请在安静环境中练习',
      ];
    } else if (score >= 90) {
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

  protected calculateSimilarity(a: string, b: string, language: string): number {
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;

    if (language.includes('zh')) {
      const longer = a.length > b.length ? a : b;
      const shorter = a.length > b.length ? b : a;
      return (longer.length - this.editDistance(longer, shorter)) / longer.length;
    }

    const wordsA = a.split(' ').filter(Boolean);
    const wordsB = b.split(' ').filter(Boolean);
    const setA = new Set(wordsA);
    const setB = new Set(wordsB);
    const intersection = [...setA].filter((word) => setB.has(word)).length;
    const tokenScore = (2 * intersection) / (setA.size + setB.size || 1);

    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    const charScore = (longer.length - this.editDistance(longer, shorter)) / longer.length;

    return tokenScore * 0.55 + charScore * 0.45;
  }

  private normalizeSpeechText(input: string, language: string): string {
    const simplifiedMap: Record<string, string> = {
      '幫': '帮',
      '謝': '谢',
      '藥': '药',
      '醫': '医',
      '臺': '台',
      '覺': '觉',
      '嗎': '吗',
      '請': '请',
      '聽': '听',
      '說': '说',
      '話': '话',
    };

    let text = input
      .toLowerCase()
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
      .replace(/[.,!?;:'"()\[\]{}，。！？；：「」『』（）]/g, ' ')
      .trim();

    if (language.includes('zh')) {
      text = text
        .split('')
        .map((char) => simplifiedMap[char] || char)
        .join('')
        .replace(/\s+/g, '');
      return text;
    }

    return text.replace(/\s+/g, ' ');
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
