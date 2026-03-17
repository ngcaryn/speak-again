import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Speech from 'expo-speech';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { BigButton } from '../../components/ui/BigButton';
import { Card } from '../../components/ui/Card';
import { useAppStore } from '../../store/appStore';
import { useFontSize } from '../../hooks/useFontSize';
import { useAI } from '../../hooks/useAI';

const COMMON_NEEDS_EN = ['Water 💧', 'Food 🍚', 'Medicine 💊', 'Help 🆘', 'Pain 😣', 'Phone 📱', 'TV Remote 📺', 'Pillow 🛏️'];
const COMMON_NEEDS_ZH_TW = ['水 💧', '食物 🍚', '藥物 💊', '幫助 🆘', '疼痛 😣', '電話 📱', '電視遙控器 📺', '枕頭 🛏️'];
const COMMON_NEEDS_ZH_CN = ['水 💧', '食物 🍚', '药物 💊', '帮助 🆘', '疼痛 😣', '电话 📱', '电视遥控器 📺', '枕头 🛏️'];

export default function CameraScreen() {
  const { t, i18n } = useTranslation();
  const { scale } = useFontSize();
  const { settings } = useAppStore();
  const ai = useAI();
  const [permission, requestPermission] = useCameraPermissions();

  const [isActive, setIsActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedItem, setDetectedItem] = useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);

  const getCommonNeeds = () => {
    if (i18n.language === 'zh-TW') return COMMON_NEEDS_ZH_TW;
    if (i18n.language === 'zh-CN') return COMMON_NEEDS_ZH_CN;
    return COMMON_NEEDS_EN;
  };

  const analyzeCapture = useCallback(async () => {
    if (!cameraRef.current || isAnalyzing) return;
    setIsAnalyzing(true);

    try {
      // In production, send frame to vision AI (Baidu Vision API or OpenAI Vision).
      // For now, provide smart suggestions using AI text analysis.
      const response = await ai.interpretGesture(
        'Patient is pointing/gesturing at something they need',
        i18n.language
      );
      setDetectedItem(response.text);
    } catch {
      setDetectedItem(t('gesture.notSure'));
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, ai, i18n.language, t]);

  const speakItem = async (item: string) => {
    const langMap: Record<string, string> = {
      'zh-TW': 'zh-TW',
      'zh-CN': 'zh-CN',
      'en': 'en-US',
    };
    // Strip emoji characters (U+1F300–U+1F9FF) so TTS reads only the label text
    const cleanText = item.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
    await Speech.speak(cleanText, {
      language: langMap[i18n.language] || 'en-US',
      rate: settings.voiceSpeed || 0.8,
    });
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionView}>
          <Text style={styles.permissionEmoji}>📷</Text>
          <Text style={[styles.permissionText, { fontSize: scale(22) }]}>{t('gesture.permission')}</Text>
          <BigButton
            title={t('gesture.permissionButton')}
            onPress={requestPermission}
            size="large"
            emoji="📷"
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: scale(28) }]}>{t('gesture.title')}</Text>
        <Text style={[styles.subtitle, { fontSize: scale(16) }]}>{t('gesture.subtitle')}</Text>
      </View>

      {/* Camera View */}
      {isActive ? (
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          >
            <View style={styles.cameraOverlay}>
              {isAnalyzing && (
                <View style={styles.analyzingBadge}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.analyzingText}>{t('gesture.analyzing')}</Text>
                </View>
              )}
              <View style={styles.cameraButtons}>
                <BigButton
                  title={t('gesture.detecting')}
                  onPress={analyzeCapture}
                  loading={isAnalyzing}
                  size="large"
                  emoji="🔍"
                  style={styles.captureButton}
                />
                <BigButton
                  title={t('gesture.stopCamera')}
                  onPress={() => { setIsActive(false); setDetectedItem(null); }}
                  variant="danger"
                  size="medium"
                  emoji="⏹️"
                  style={styles.stopButton}
                />
              </View>
            </View>
          </CameraView>
        </View>
      ) : (
        <View style={styles.startSection}>
          <Text style={styles.cameraOffEmoji}>📷</Text>
          <Text style={[styles.instructions, { fontSize: scale(18) }]}>{t('gesture.instructions')}</Text>
          <BigButton
            title={t('gesture.startCamera')}
            onPress={() => setIsActive(true)}
            size="xlarge"
            emoji="📷"
            fullWidth
          />
        </View>
      )}

      {/* Detection Result */}
      {detectedItem && (
        <Card style={styles.detectionCard}>
          <Text style={[styles.detectedLabel, { fontSize: scale(16) }]}>{t('gesture.detected')}</Text>
          <Text style={[styles.detectedText, { fontSize: scale(22) }]}>{detectedItem}</Text>
        </Card>
      )}

      {/* Quick Pick Buttons */}
      <ScrollView style={styles.suggestionsScroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.suggestionsLabel, { fontSize: scale(16) }]}>
          {t('gesture.tapToConfirm')}
        </Text>
        <View style={styles.suggestionsGrid}>
          {getCommonNeeds().map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.suggestionButton}
              onPress={() => speakItem(item)}
              accessibilityRole="button"
            >
              <Text style={[styles.suggestionText, { fontSize: scale(16) }]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 16 },
  title: { fontWeight: '800', color: Colors.text, marginBottom: 4 },
  subtitle: { color: Colors.textSecondary },
  permissionView: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  permissionEmoji: { fontSize: 80, marginBottom: 24 },
  permissionText: { fontWeight: '600', color: Colors.text, textAlign: 'center', marginBottom: 24 },
  cameraContainer: { height: 280, margin: 16, borderRadius: 20, overflow: 'hidden' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, justifyContent: 'flex-end', padding: 16 },
  analyzingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 12,
    alignSelf: 'center',
    marginBottom: 12,
    gap: 8,
  },
  analyzingText: { color: 'white', fontWeight: '600' },
  cameraButtons: { flexDirection: 'row', gap: 12 },
  captureButton: { flex: 1 },
  stopButton: { flex: 0 },
  startSection: { alignItems: 'center', padding: 24 },
  cameraOffEmoji: { fontSize: 80, marginBottom: 16 },
  instructions: { color: Colors.textSecondary, textAlign: 'center', marginBottom: 24, fontWeight: '500', lineHeight: 28 },
  detectionCard: { marginHorizontal: 16 },
  detectedLabel: { color: Colors.textSecondary, fontWeight: '600', marginBottom: 8 },
  detectedText: { color: Colors.text, fontWeight: '700' },
  suggestionsScroll: { flex: 1, paddingHorizontal: 16 },
  suggestionsLabel: { color: Colors.textSecondary, fontWeight: '600', marginTop: 8, marginBottom: 12 },
  suggestionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 32 },
  suggestionButton: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  suggestionText: { color: Colors.text, fontWeight: '600' },
});
