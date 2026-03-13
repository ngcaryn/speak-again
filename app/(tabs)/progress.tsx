import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useAppStore } from '../../store/appStore';
import { useFontSize } from '../../hooks/useFontSize';

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export default function ProgressScreen() {
  const { t } = useTranslation();
  const { scale } = useFontSize();
  const { progress } = useAppStore();

  const maxWeekly = Math.max(...progress.weeklyData, 1);
  const today = new Date().getDay();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { fontSize: scale(30) }]}>{t('progress.title')}</Text>
          <Text style={[styles.subtitle, { fontSize: scale(18) }]}>{t('progress.subtitle')}</Text>
        </View>

        {/* Main Stats */}
        <View style={styles.statsGrid}>
          <StatCard emoji="📅" value={progress.totalSessions} label={t('progress.totalSessions')} color={Colors.primary} />
          <StatCard emoji="⏱️" value={progress.totalMinutes} label={t('progress.totalMinutes')} color={Colors.secondary} />
        </View>
        <View style={styles.statsGrid}>
          <StatCard emoji="🔥" value={progress.currentStreak} label={t('progress.currentStreak')} color={Colors.accent} />
          <StatCard emoji="🏆" value={progress.longestStreak} label={t('progress.longestStreak')} color={Colors.primaryDark} />
        </View>

        {/* Accuracy */}
        <Card>
          <Text style={[styles.cardTitle, { fontSize: scale(20) }]}>🎯 {t('progress.speechAccuracy')}</Text>
          <Text style={[styles.accuracyValue, { fontSize: scale(40), color: Colors.primary }]}>
            {progress.speechAccuracy}%
          </Text>
          <ProgressBar progress={progress.speechAccuracy} color={Colors.primary} height={16} />
        </Card>

        {/* Weekly Chart */}
        <Card>
          <Text style={[styles.cardTitle, { fontSize: scale(20) }]}>📈 {t('progress.weeklyChart')}</Text>
          <View style={styles.weekChart}>
            {progress.weeklyData.map((mins, dayIndex) => (
              <View key={dayIndex} style={styles.dayColumn}>
                <Text style={[styles.barValue, { fontSize: scale(12) }]}>{mins > 0 ? mins : ''}</Text>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(4, (mins / maxWeekly) * 80),
                        backgroundColor: dayIndex === today ? Colors.primary : Colors.primaryLight,
                      },
                    ]}
                  />
                </View>
                <Text style={[
                  styles.dayLabel,
                  {
                    fontSize: scale(12),
                    fontWeight: dayIndex === today ? '800' : '500',
                    color: dayIndex === today ? Colors.primary : Colors.textSecondary,
                  },
                ]}>
                  {t(`progress.${DAY_KEYS[dayIndex]}` as any)}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Exercises */}
        <View style={styles.statsGrid}>
          <StatCard emoji="💬" value={progress.wordsLearned} label={t('progress.wordsLearned')} color={Colors.secondary} />
          <StatCard emoji="✅" value={progress.exercisesCompleted} label={t('progress.exercisesCompleted')} color={Colors.success} />
        </View>

        {progress.totalSessions === 0 && (
          <Card style={styles.noDataCard}>
            <Text style={styles.noDataEmoji}>🌱</Text>
            <Text style={[styles.noDataText, { fontSize: scale(18) }]}>{t('progress.noData')}</Text>
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
  statsGrid: { flexDirection: 'row', marginBottom: 4, gap: 4 },
  cardTitle: { fontWeight: '700', color: Colors.text, marginBottom: 12 },
  accuracyValue: { fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  weekChart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120 },
  dayColumn: { alignItems: 'center', flex: 1 },
  barValue: { color: Colors.textSecondary, marginBottom: 4, fontWeight: '600' },
  barContainer: { height: 80, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: '70%', borderRadius: 6, minHeight: 4 },
  dayLabel: { marginTop: 4 },
  noDataCard: { alignItems: 'center', paddingVertical: 32 },
  noDataEmoji: { fontSize: 48, marginBottom: 12 },
  noDataText: { color: Colors.textSecondary, textAlign: 'center', fontWeight: '600' },
});
