import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { BigButton } from '../../components/ui/BigButton';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useAppStore } from '../../store/appStore';
import { useFontSize } from '../../hooks/useFontSize';
import { useAI } from '../../hooks/useAI';
import type { SpeechFeedback } from '../../services/ai/AIProvider';

type RecordState = 'idle' | 'recording' | 'processing' | 'result';

const PRACTICE_WORDS_EN = ['Hello', 'Water', 'Help', 'Thank you', 'Good morning', 'Family', 'Food', 'Medicine'];
const PRACTICE_WORDS_TW = ['你好', '水', '幫助', '謝謝', '早安', '家人', '食物', '藥物'];
const PRACTICE_WORDS_CN = ['你好', '水', '帮助', '谢谢', '早安', '家人', '食物', '药物'];

export default function SpeechScreen() {
  const { t, i18n } = useTranslation();
  const { scale } = useFontSize();
  const { settings, recordExercise } = useAppStore();
  const ai = useAI();

  const [state, setState] = useState<RecordState>('idle');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [spokenText, setSpokenText] = useState('');
  const [feedback, setFeedback] = useState<SpeechFeedback | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const getPracticeWords = () => {
    if (i18n.language === 'zh-TW') return PRACTICE_WORDS_TW;
    if (i18n.language === 'zh-CN') return PRACTICE_WORDS_CN;
    return PRACTICE_WORDS_EN;
  };

  const currentWord = getPracticeWords()[currentWordIndex];

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [pulseAnim]);

  const requestPermission = async () => {
    const { granted } = await Audio.requestPermissionsAsync();
    setHasPermission(granted);
    return granted;
  };

  const speakTargetWord = async () => {
    const langMap: Record<string, string> = {
      'zh-TW': 'zh-TW',
      'zh-CN': 'zh-CN',
      'en': 'en-US',
    };
    await Speech.speak(currentWord, {
      language: langMap[i18n.language] || 'en-US',
      rate: settings.voiceSpeed || 0.8,
      pitch: 1.0,
    });
  };

  const startRecording = async () => {
    const granted = hasPermission ?? await requestPermission();
    if (!granted) {
      Alert.alert(t('common.noPermission'), t('speech.noPermission'));
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setState('recording');
      startPulse();
    } catch (err) {
      Alert.alert(t('common.error'), String(err));
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    stopPulse();
    setState('processing');

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      // For demo/offline, simulate speech recognition result.
      // In production: pass `uri` to BaiduASRProvider.recognize(uri, language)
      // which returns a SpeechResult with the transcribed text to compare against currentWord.
      const simulatedSpoken = currentWord;
      setSpokenText(simulatedSpoken);

      const result = await ai.generateSpeechFeedback(
        currentWord,
        simulatedSpoken,
        i18n.language
      );
      setFeedback(result);
      await recordExercise(result.score);
      setState('result');
    } catch (err) {
      setState('idle');
      Alert.alert(t('common.error'), String(err));
    }
  };

  const nextWord = () => {
    const words = getPracticeWords();
    setCurrentWordIndex((prev) => (prev + 1) % words.length);
    setState('idle');
    setFeedback(null);
    setSpokenText('');
  };

  const tryAgain = () => {
    setState('idle');
    setFeedback(null);
    setSpokenText('');
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return Colors.success;
    if (score >= 70) return Colors.accent;
    return Colors.error;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { fontSize: scale(30) }]}>{t('speech.title')}</Text>
          <Text style={[styles.subtitle, { fontSize: scale(18) }]}>{t('speech.subtitle')}</Text>
        </View>

        {/* Target Word Card */}
        <Card style={styles.wordCard}>
          <Text style={[styles.wordLabel, { fontSize: scale(16) }]}>{t('speech.targetWord')}</Text>
          <Text style={[styles.targetWord, { fontSize: scale(52) }]}>{currentWord}</Text>
          <BigButton
            title={t('speech.readAloud')}
            onPress={speakTargetWord}
            variant="outline"
            size="medium"
            emoji="🔊"
            style={styles.listenButton}
          />
        </Card>

        {/* Recording Area */}
        {state === 'idle' && (
          <View style={styles.recordSection}>
            <TouchableOpacity
              onPress={startRecording}
              style={styles.recordButton}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('speech.record')}
            >
              <Text style={styles.micEmoji}>🎤</Text>
              <Text style={[styles.recordText, { fontSize: scale(22) }]}>{t('speech.record')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {state === 'recording' && (
          <View style={styles.recordSection}>
            <Animated.View style={[styles.recordingIndicator, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.micEmoji}>🎤</Text>
            </Animated.View>
            <Text style={[styles.recordingText, { fontSize: scale(22) }]}>{t('speech.recording')}</Text>
            <BigButton
              title={t('common.done')}
              onPress={stopRecording}
              variant="danger"
              size="large"
              emoji="⏹️"
              style={{ marginTop: 16 }}
            />
          </View>
        )}

        {state === 'processing' && (
          <View style={styles.recordSection}>
            <Text style={styles.processEmoji}>⚙️</Text>
            <Text style={[styles.recordingText, { fontSize: scale(22) }]}>{t('speech.processing')}</Text>
          </View>
        )}

        {/* Results */}
        {state === 'result' && feedback && (
          <Card style={styles.resultCard}>
            <Text style={[styles.resultScore, { fontSize: scale(48), color: getScoreColor(feedback.score) }]}>
              {feedback.score}
            </Text>
            <Text style={[styles.resultScoreLabel, { fontSize: scale(16) }]}>{t('speech.score')}</Text>
            <ProgressBar progress={feedback.score} color={getScoreColor(feedback.score)} height={16} />

            <Text style={[styles.feedbackText, { fontSize: scale(22) }]}>{feedback.feedback}</Text>

            {feedback.suggestions.map((s, i) => (
              <Text key={i} style={[styles.suggestion, { fontSize: scale(16) }]}>• {s}</Text>
            ))}

            <View style={styles.resultActions}>
              <BigButton
                title={t('speech.tryAgain')}
                onPress={tryAgain}
                variant="outline"
                size="medium"
                emoji="🔄"
                style={{ flex: 1, marginRight: 8 }}
              />
              <BigButton
                title={t('speech.nextExercise')}
                onPress={nextWord}
                variant="primary"
                size="medium"
                emoji="➡️"
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        )}

        {/* Word Navigator */}
        <View style={styles.wordNav}>
          {getPracticeWords().map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => { setCurrentWordIndex(i); setState('idle'); setFeedback(null); }}
              style={[styles.wordDot, i === currentWordIndex && styles.wordDotActive]}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingBottom: 32 },
  header: { paddingVertical: 16 },
  title: { fontWeight: '800', color: Colors.text, marginBottom: 4 },
  subtitle: { color: Colors.textSecondary, fontWeight: '500' },
  wordCard: { alignItems: 'center', paddingVertical: 32 },
  wordLabel: { color: Colors.textSecondary, fontWeight: '600', marginBottom: 8 },
  targetWord: { fontWeight: '800', color: Colors.text, marginBottom: 16, textAlign: 'center' },
  listenButton: { marginTop: 8 },
  recordSection: { alignItems: 'center', paddingVertical: 32 },
  recordButton: {
    backgroundColor: Colors.primary,
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  micEmoji: { fontSize: 52 },
  recordText: { color: Colors.primary, fontWeight: '700', marginTop: 8 },
  recordingIndicator: {
    backgroundColor: Colors.error,
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingText: { color: Colors.error, fontWeight: '700', marginTop: 16 },
  processEmoji: { fontSize: 64, marginBottom: 16 },
  resultCard: { alignItems: 'center' },
  resultScore: { fontWeight: '900' },
  resultScoreLabel: { color: Colors.textSecondary, marginBottom: 12 },
  feedbackText: { fontWeight: '700', color: Colors.text, textAlign: 'center', marginVertical: 16 },
  suggestion: { color: Colors.textSecondary, marginBottom: 4, alignSelf: 'flex-start' },
  resultActions: { flexDirection: 'row', marginTop: 16, width: '100%' },
  wordNav: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 8 },
  wordDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.border },
  wordDotActive: { backgroundColor: Colors.primary, width: 24 },
});
