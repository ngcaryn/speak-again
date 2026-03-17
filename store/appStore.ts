import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIProviderType } from '../services/ai/AIProvider';
import { SpeechProviderType } from '../services/speech/SpeechProvider';
import { LanguageCode } from '../i18n';

export type FontSizeLevel = 'normal' | 'large' | 'extraLarge';

export interface AppSettings {
  language: LanguageCode;
  fontSize: FontSizeLevel;
  highContrast: boolean;
  vibration: boolean;
  sound: boolean;
  therapeuticMode: boolean;
  dailyReminder: boolean;
  reminderTime: string;
  voiceSpeed: number;
  aiProvider: AIProviderType;
  aiApiKey: string;
  aiApiSecret: string;
  aiModel: string;
  speechProvider: SpeechProviderType;
  speechApiKey: string;
  speechApiSecret: string;
}

export interface ProgressData {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  speechAccuracy: number;
  wordsLearned: number;
  exercisesCompleted: number;
  weeklyData: number[];
}

interface AppState {
  settings: AppSettings;
  progress: ProgressData;
  isLoaded: boolean;

  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  updateProgress: (updates: Partial<ProgressData>) => Promise<void>;
  recordSession: (durationMinutes: number) => Promise<void>;
  recordExercise: (accuracy?: number) => Promise<void>;
  resetProgress: () => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'zh-TW',
  fontSize: 'large',
  highContrast: false,
  vibration: true,
  sound: true,
  therapeuticMode: false,
  dailyReminder: false,
  reminderTime: '09:00',
  voiceSpeed: 0.8,
  aiProvider: 'local',
  aiApiKey: '',
  aiApiSecret: '',
  aiModel: '',
  speechProvider: 'device',
  speechApiKey: '',
  speechApiSecret: '',
};

const DEFAULT_PROGRESS: ProgressData = {
  totalSessions: 0,
  totalMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastSessionDate: null,
  speechAccuracy: 0,
  wordsLearned: 0,
  exercisesCompleted: 0,
  weeklyData: [0, 0, 0, 0, 0, 0, 0],
};

const SETTINGS_KEY = '@speak_again_settings';
const PROGRESS_KEY = '@speak_again_progress';

export const useAppStore = create<AppState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  progress: DEFAULT_PROGRESS,
  isLoaded: false,

  loadSettings: async () => {
    try {
      const [settingsStr, progressStr] = await Promise.all([
        AsyncStorage.getItem(SETTINGS_KEY),
        AsyncStorage.getItem(PROGRESS_KEY),
      ]);

      const settings = settingsStr ? { ...DEFAULT_SETTINGS, ...JSON.parse(settingsStr) } : DEFAULT_SETTINGS;
      const progress = progressStr ? { ...DEFAULT_PROGRESS, ...JSON.parse(progressStr) } : DEFAULT_PROGRESS;

      set({ settings, progress, isLoaded: true });
    } catch {
      set({ isLoaded: true });
    }
  },

  updateSettings: async (updates) => {
    const newSettings = { ...get().settings, ...updates };
    set({ settings: newSettings });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  },

  updateProgress: async (updates) => {
    const newProgress = { ...get().progress, ...updates };
    set({ progress: newProgress });
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
  },

  recordSession: async (durationMinutes: number) => {
    const { progress } = get();
    const today = new Date().toDateString();
    const lastDate = progress.lastSessionDate;
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let newStreak = progress.currentStreak;
    if (lastDate === today) {
      // Already practiced today, streak unchanged
    } else if (lastDate === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    const dayOfWeek = new Date().getDay();
    const newWeeklyData = [...progress.weeklyData];
    newWeeklyData[dayOfWeek] = (newWeeklyData[dayOfWeek] || 0) + durationMinutes;

    const updates: Partial<ProgressData> = {
      totalSessions: progress.totalSessions + 1,
      totalMinutes: progress.totalMinutes + durationMinutes,
      currentStreak: newStreak,
      longestStreak: Math.max(progress.longestStreak, newStreak),
      lastSessionDate: today,
      weeklyData: newWeeklyData,
    };

    await get().updateProgress(updates);
  },

  recordExercise: async (accuracy?: number) => {
    const { progress } = get();
    const updates: Partial<ProgressData> = {
      exercisesCompleted: progress.exercisesCompleted + 1,
    };

    if (accuracy !== undefined) {
      const totalAccuracy = (progress.speechAccuracy * progress.exercisesCompleted + accuracy) /
                            (progress.exercisesCompleted + 1);
      updates.speechAccuracy = Math.round(totalAccuracy);
    }

    await get().updateProgress(updates);
  },

  resetProgress: async () => {
    set({ progress: DEFAULT_PROGRESS });
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(DEFAULT_PROGRESS));
  },
}));
