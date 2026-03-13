import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { useAppStore } from '../../store/appStore';
import { useFontSize } from '../../hooks/useFontSize';

const { width } = Dimensions.get('window');

interface FeatureCardProps {
  emoji: string;
  title: string;
  description: string;
  route: string;
  color: string;
  onPress: () => void;
}

function FeatureCard({ emoji, title, description, color, onPress }: FeatureCardProps) {
  const { scale } = useFontSize();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.featureCard, { borderLeftColor: color, borderLeftWidth: 6 }]}
      accessibilityRole="button"
    >
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <View style={styles.featureText}>
        <Text style={[styles.featureTitle, { fontSize: scale(20) }]}>{title}</Text>
        <Text style={[styles.featureDesc, { fontSize: scale(15) }]}>{description}</Text>
      </View>
      <Text style={[styles.arrow, { color }]}>›</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { progress } = useAppStore();
  const { scale } = useFontSize();

  const todayMinutes = progress.weeklyData[new Date().getDay()] || 0;

  const features = [
    {
      emoji: '🗣️',
      title: t('home.speechPractice'),
      description: t('home.speechPracticeDesc'),
      route: '/speech',
      color: Colors.primary,
    },
    {
      emoji: '🖼️',
      title: t('home.pictureBoard'),
      description: t('home.pictureBoardDesc'),
      route: '/pictures',
      color: Colors.secondary,
    },
    {
      emoji: '🧠',
      title: t('home.brainExercises'),
      description: t('home.brainExercisesDesc'),
      route: '/cognitive',
      color: Colors.accent,
    },
    {
      emoji: '📷',
      title: t('home.gestureCamera'),
      description: t('home.gestureCameraDesc'),
      route: '/camera',
      color: '#9B59B6',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { fontSize: scale(32) }]}>
            {t('home.greeting')}
          </Text>
          <Text style={[styles.subtitle, { fontSize: scale(18) }]}>
            {t('home.subtitle')}
          </Text>
          {progress.currentStreak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={[styles.streakText, { fontSize: scale(16) }]}>
                🔥 {progress.currentStreak} {t('home.streak')}
              </Text>
            </View>
          )}
        </View>

        {/* Today's stats */}
        <View style={styles.statsRow}>
          <StatCard
            emoji="⏱️"
            value={todayMinutes}
            label={t('home.minutesPracticed')}
            color={Colors.primary}
          />
          <StatCard
            emoji="🏆"
            value={progress.exercisesCompleted}
            label={t('progress.exercisesCompleted')}
            color={Colors.secondary}
          />
          <StatCard
            emoji="🔥"
            value={progress.currentStreak}
            label={t('home.streak')}
            color={Colors.accent}
          />
        </View>

        {/* Encouragement */}
        <Card style={styles.encouragementCard}>
          <Text style={[styles.encouragement, { fontSize: scale(18) }]}>
            💪 {t('home.encouragement')}
          </Text>
        </Card>

        {/* Feature Cards */}
        <Text style={[styles.sectionLabel, { fontSize: scale(16) }]}>
          {t('home.subtitle')}
        </Text>
        {features.map((feature) => (
          <FeatureCard
            key={feature.route}
            {...feature}
            onPress={() => router.push(feature.route as any)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  greeting: {
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 12,
  },
  streakBadge: {
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  streakText: {
    color: Colors.accent,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 4,
  },
  encouragementCard: {
    backgroundColor: Colors.primaryLight,
    marginBottom: 16,
  },
  encouragement: {
    color: Colors.primaryDark,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 4,
  },
  featureCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  featureDesc: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 32,
    fontWeight: '300',
    marginLeft: 8,
  },
});
