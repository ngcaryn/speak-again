import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { BigButton } from '../../components/ui/BigButton';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useAppStore } from '../../store/appStore';
import { useFontSize } from '../../hooks/useFontSize';
import { CognitiveExercises } from '../../constants/therapy';

interface Question {
  id: string;
  type: 'match' | 'fill' | 'name';
  prompt: string;
  emoji?: string;
  options: { id: string; text: string; emoji?: string }[];
  correctId: string;
}

const QUESTIONS_EN: Question[] = [
  {
    id: '1', type: 'match', prompt: 'Find: Water', emoji: '💧',
    options: [{ id: 'a', text: 'Water', emoji: '💧' }, { id: 'b', text: 'Food', emoji: '🍚' },
              { id: 'c', text: 'Medicine', emoji: '💊' }, { id: 'd', text: 'Sleep', emoji: '😴' }],
    correctId: 'a',
  },
  {
    id: '2', type: 'name', prompt: 'What is this? 🏥',
    options: [{ id: 'a', text: 'Home', emoji: '🏠' }, { id: 'b', text: 'Hospital', emoji: '🏥' },
              { id: 'c', text: 'School', emoji: '🏫' }, { id: 'd', text: 'Park', emoji: '🌳' }],
    correctId: 'b',
  },
  {
    id: '3', type: 'fill', prompt: 'I need ___',
    options: [{ id: 'a', text: 'Help', emoji: '🆘' }, { id: 'b', text: 'Sleep', emoji: '😴' },
              { id: 'c', text: 'Walk', emoji: '🚶' }, { id: 'd', text: 'Phone', emoji: '📱' }],
    correctId: 'a',
  },
  {
    id: '4', type: 'match', prompt: 'Find: Doctor', emoji: '👨‍⚕️',
    options: [{ id: 'a', text: 'Nurse', emoji: '👩‍⚕️' }, { id: 'b', text: 'Family', emoji: '👨‍👩‍👧' },
              { id: 'c', text: 'Doctor', emoji: '👨‍⚕️' }, { id: 'd', text: 'Friend', emoji: '🤝' }],
    correctId: 'c',
  },
  {
    id: '5', type: 'name', prompt: 'What is this? 📱',
    options: [{ id: 'a', text: 'TV', emoji: '📺' }, { id: 'b', text: 'Book', emoji: '📖' },
              { id: 'c', text: 'Phone', emoji: '📱' }, { id: 'd', text: 'Medicine', emoji: '💊' }],
    correctId: 'c',
  },
];

const QUESTIONS_ZH: Question[] = [
  {
    id: '1', type: 'match', prompt: '找出：水', emoji: '💧',
    options: [{ id: 'a', text: '水', emoji: '💧' }, { id: 'b', text: '食物', emoji: '🍚' },
              { id: 'c', text: '藥物', emoji: '💊' }, { id: 'd', text: '睡覺', emoji: '😴' }],
    correctId: 'a',
  },
  {
    id: '2', type: 'name', prompt: '這是什麼？🏥',
    options: [{ id: 'a', text: '家', emoji: '🏠' }, { id: 'b', text: '醫院', emoji: '🏥' },
              { id: 'c', text: '學校', emoji: '🏫' }, { id: 'd', text: '公園', emoji: '🌳' }],
    correctId: 'b',
  },
  {
    id: '3', type: 'fill', prompt: '我需要___',
    options: [{ id: 'a', text: '幫助', emoji: '🆘' }, { id: 'b', text: '睡覺', emoji: '😴' },
              { id: 'c', text: '走路', emoji: '🚶' }, { id: 'd', text: '電話', emoji: '📱' }],
    correctId: 'a',
  },
  {
    id: '4', type: 'match', prompt: '找出：醫生', emoji: '👨‍⚕️',
    options: [{ id: 'a', text: '護士', emoji: '👩‍⚕️' }, { id: 'b', text: '家人', emoji: '👨‍👩‍👧' },
              { id: 'c', text: '醫生', emoji: '👨‍⚕️' }, { id: 'd', text: '朋友', emoji: '🤝' }],
    correctId: 'c',
  },
  {
    id: '5', type: 'name', prompt: '這是什麼？📱',
    options: [{ id: 'a', text: '電視', emoji: '📺' }, { id: 'b', text: '書', emoji: '📖' },
              { id: 'c', text: '電話', emoji: '📱' }, { id: 'd', text: '藥物', emoji: '💊' }],
    correctId: 'c',
  },
];

type GameState = 'menu' | 'playing' | 'result';

export default function CognitiveScreen() {
  const { t, i18n } = useTranslation();
  const { scale } = useFontSize();
  const { recordExercise } = useAppStore();

  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const questions = i18n.language.startsWith('zh') ? QUESTIONS_ZH : QUESTIONS_EN;
  const currentQuestion = questions[currentIndex];

  const handleAnswer = useCallback(async (optionId: string) => {
    if (answered) return;
    setSelectedId(optionId);
    setAnswered(true);
    if (optionId === currentQuestion.correctId) {
      setScore((s) => s + 1);
    }
  }, [answered, currentQuestion]);

  const nextQuestion = async () => {
    if (currentIndex + 1 >= questions.length) {
      const accuracy = Math.round((score / questions.length) * 100);
      await recordExercise(accuracy);
      setGameState('result');
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedId(null);
      setAnswered(false);
    }
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentIndex(0);
    setScore(0);
    setSelectedId(null);
    setAnswered(false);
  };

  const getOptionStyle = (optionId: string) => {
    if (!answered) return styles.option;
    if (optionId === currentQuestion.correctId) return [styles.option, styles.optionCorrect];
    if (optionId === selectedId) return [styles.option, styles.optionWrong];
    return [styles.option, styles.optionDimmed];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { fontSize: scale(28) }]}>{t('cognitive.title')}</Text>
          <Text style={[styles.subtitle, { fontSize: scale(16) }]}>{t('cognitive.subtitle')}</Text>
        </View>

        {gameState === 'menu' && (
          <View>
            {CognitiveExercises.map((ex) => (
              <Card key={ex.id} onPress={startGame} style={styles.exerciseCard}>
                <Text style={styles.exEmoji}>{ex.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exTitle, { fontSize: scale(20) }]}>{t(ex.titleKey as any)}</Text>
                  <Text style={[styles.exDesc, { fontSize: scale(15) }]}>{t(ex.descriptionKey as any)}</Text>
                  <View style={[styles.diffBadge, { backgroundColor: ex.difficulty === 'easy' ? '#E8F5E9' : '#FFF3E0' }]}>
                    <Text style={[styles.diffText, { color: ex.difficulty === 'easy' ? Colors.success : Colors.accent, fontSize: scale(13) }]}>
                      {t(`cognitive.difficulty.${ex.difficulty}` as any)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.arrow, { color: Colors.primary }]}>›</Text>
              </Card>
            ))}
          </View>
        )}

        {gameState === 'playing' && currentQuestion && (
          <View>
            {/* Progress */}
            <View style={styles.gameProgress}>
              <Text style={[styles.progressText, { fontSize: scale(16) }]}>
                {t('cognitive.question')} {currentIndex + 1} / {questions.length}
              </Text>
              <ProgressBar
                progress={((currentIndex + 1) / questions.length) * 100}
                color={Colors.primary}
              />
            </View>

            {/* Question */}
            <Card style={styles.questionCard}>
              {currentQuestion.emoji && (
                <Text style={styles.questionEmoji}>{currentQuestion.emoji}</Text>
              )}
              <Text style={[styles.questionText, { fontSize: scale(24) }]}>
                {currentQuestion.prompt}
              </Text>
            </Card>

            {/* Options */}
            <View style={styles.optionsGrid}>
              {currentQuestion.options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={getOptionStyle(option.id)}
                  onPress={() => handleAnswer(option.id)}
                  disabled={answered}
                  accessibilityRole="button"
                >
                  {option.emoji && <Text style={styles.optionEmoji}>{option.emoji}</Text>}
                  <Text style={[styles.optionText, { fontSize: scale(18) }]}>{option.text}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {answered && (
              <View style={styles.feedbackRow}>
                <Text style={[styles.feedbackText, { fontSize: scale(22), color: selectedId === currentQuestion.correctId ? Colors.success : Colors.error }]}>
                  {selectedId === currentQuestion.correctId ? t('cognitive.correct') : t('cognitive.incorrect')}
                </Text>
                <BigButton
                  title={currentIndex + 1 < questions.length ? t('cognitive.nextQuestion') : t('cognitive.viewResults')}
                  onPress={nextQuestion}
                  size="large"
                  emoji={currentIndex + 1 < questions.length ? '➡️' : '🎉'}
                />
              </View>
            )}
          </View>
        )}

        {gameState === 'result' && (
          <Card style={styles.resultCard}>
            <Text style={styles.resultEmoji}>🎉</Text>
            <Text style={[styles.resultTitle, { fontSize: scale(28) }]}>{t('cognitive.complete')}</Text>
            <Text style={[styles.resultScore, { fontSize: scale(48), color: Colors.primary }]}>
              {score}/{questions.length}
            </Text>
            <ProgressBar
              progress={(score / questions.length) * 100}
              color={Colors.primary}
              height={16}
              showLabel
              label={`${Math.round((score / questions.length) * 100)}%`}
            />
            <View style={styles.resultButtons}>
              <BigButton
                title={t('cognitive.playAgain')}
                onPress={startGame}
                size="large"
                emoji="🔄"
                variant="primary"
                fullWidth
              />
              <BigButton
                title={t('common.back')}
                onPress={() => setGameState('menu')}
                size="large"
                variant="outline"
                fullWidth
                style={{ marginTop: 12 }}
              />
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingBottom: 32 },
  header: { paddingVertical: 16 },
  title: { fontWeight: '800', color: Colors.text, marginBottom: 4 },
  subtitle: { color: Colors.textSecondary },
  exerciseCard: { flexDirection: 'row', alignItems: 'center' },
  exEmoji: { fontSize: 40, marginRight: 16 },
  exTitle: { fontWeight: '700', color: Colors.text, marginBottom: 4 },
  exDesc: { color: Colors.textSecondary, marginBottom: 8 },
  diffBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  diffText: { fontWeight: '700' },
  arrow: { fontSize: 32, marginLeft: 8 },
  gameProgress: { marginBottom: 16 },
  progressText: { color: Colors.textSecondary, fontWeight: '600', marginBottom: 8 },
  questionCard: { alignItems: 'center', paddingVertical: 32 },
  questionEmoji: { fontSize: 64, marginBottom: 12 },
  questionText: { fontWeight: '700', color: Colors.text, textAlign: 'center' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  option: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  optionCorrect: { backgroundColor: '#E8F5E9', borderColor: Colors.success },
  optionWrong: { backgroundColor: '#FFEBEE', borderColor: Colors.error },
  optionDimmed: { opacity: 0.5 },
  optionEmoji: { fontSize: 40, marginBottom: 8 },
  optionText: { fontWeight: '700', color: Colors.text, textAlign: 'center' },
  feedbackRow: { marginTop: 16, alignItems: 'center' },
  feedbackText: { fontWeight: '800', marginBottom: 16 },
  resultCard: { alignItems: 'center', paddingVertical: 32 },
  resultEmoji: { fontSize: 64 },
  resultTitle: { fontWeight: '800', color: Colors.text, marginVertical: 12 },
  resultScore: { fontWeight: '900', marginBottom: 12 },
  resultButtons: { width: '100%', marginTop: 24 },
});
