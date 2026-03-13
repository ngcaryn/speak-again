import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { BigButton } from '../../components/ui/BigButton';
import { EmojiButton } from '../../components/ui/EmojiButton';
import { useAppStore } from '../../store/appStore';
import { useFontSize } from '../../hooks/useFontSize';
import { AACCategories } from '../../constants/therapy';

export default function PicturesScreen() {
  const { t, i18n } = useTranslation();
  const { scale } = useFontSize();
  const { settings, recordExercise } = useAppStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [message, setMessage] = useState<string[]>([]);

  const category = AACCategories.find((c) => c.id === selectedCategory);

  const addToMessage = async (itemLabel: string) => {
    setMessage((prev) => [...prev, itemLabel]);
    await recordExercise();
  };

  const speakMessage = async () => {
    if (message.length === 0) return;
    const text = message.join(' ');
    const langMap: Record<string, string> = {
      'zh-TW': 'zh-TW',
      'zh-CN': 'zh-CN',
      'en': 'en-US',
    };
    await Speech.speak(text, {
      language: langMap[i18n.language] || 'en-US',
      rate: settings.voiceSpeed || 0.8,
    });
  };

  const speakItem = async (label: string) => {
    const langMap: Record<string, string> = {
      'zh-TW': 'zh-TW',
      'zh-CN': 'zh-CN',
      'en': 'en-US',
    };
    await Speech.speak(label, {
      language: langMap[i18n.language] || 'en-US',
      rate: settings.voiceSpeed || 0.8,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: scale(28) }]}>{t('aac.title')}</Text>
        <Text style={[styles.subtitle, { fontSize: scale(16) }]}>{t('aac.subtitle')}</Text>
      </View>

      {/* Message Builder */}
      {message.length > 0 && (
        <View style={styles.messageBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.messageScroll}>
            {message.map((word, i) => (
              <TouchableOpacity
                key={i}
                style={styles.messageWord}
                onPress={() => setMessage((prev) => prev.filter((_, idx) => idx !== i))}
              >
                <Text style={[styles.messageWordText, { fontSize: scale(18) }]}>{word}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.messageActions}>
            <BigButton title={t('aac.speak')} onPress={speakMessage} emoji="🔊" size="medium" />
            <BigButton
              title={t('aac.clear')}
              onPress={() => setMessage([])}
              variant="outline"
              size="medium"
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {!selectedCategory ? (
          // Category View
          <View>
            <Text style={[styles.sectionLabel, { fontSize: scale(18) }]}>
              {t('aac.allCategories')}
            </Text>
            <View style={styles.categoryGrid}>
              {AACCategories.map((cat) => (
                <EmojiButton
                  key={cat.id}
                  emoji={cat.emoji}
                  label={t(cat.labelKey as any)}
                  onPress={() => setSelectedCategory(cat.id)}
                  size={90}
                  style={styles.categoryButton}
                />
              ))}
            </View>
          </View>
        ) : (
          // Items View
          <View>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedCategory(null)}
              accessibilityRole="button"
            >
              <Text style={[styles.backText, { fontSize: scale(18) }]}>
                ← {t('aac.allCategories')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.sectionLabel, { fontSize: scale(20) }]}>
              {category?.emoji} {t(category?.labelKey as any)}
            </Text>
            <View style={styles.itemsGrid}>
              {category?.items.map((item) => {
                const label = t(item.labelKey as any);
                return (
                  <EmojiButton
                    key={item.id}
                    emoji={item.emoji}
                    label={label}
                    onPress={() => {
                      speakItem(label);
                      addToMessage(label);
                    }}
                    size={90}
                    style={styles.itemButton}
                  />
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontWeight: '800', color: Colors.text, marginBottom: 4 },
  subtitle: { color: Colors.textSecondary },
  messageBar: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    padding: 12,
  },
  messageScroll: { maxHeight: 60, marginBottom: 8 },
  messageWord: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  messageWordText: { color: Colors.primaryDark, fontWeight: '700' },
  messageActions: { flexDirection: 'row', gap: 8 },
  scroll: { padding: 16, paddingBottom: 32 },
  sectionLabel: {
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  categoryButton: { margin: 6 },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  itemButton: { margin: 6 },
  backButton: { marginBottom: 16 },
  backText: { color: Colors.primary, fontWeight: '700' },
});
