import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { Colors } from '../../constants/colors';
import { BigButton } from '../../components/ui/BigButton';
import { Card } from '../../components/ui/Card';
import { useAppStore } from '../../store/appStore';
import { useFontSize } from '../../hooks/useFontSize';
import { useAppSettings } from '../../hooks/useAppSettings';
import { LANGUAGES } from '../../i18n';
import type { AIProviderType } from '../../services/ai/AIProvider';
import type { SpeechProviderType } from '../../services/speech/SpeechProvider';
import type { FontSizeLevel } from '../../store/appStore';

function SettingRow({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  const { scale } = useFontSize();
  return (
    <View style={styles.settingRow}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingLabel, { fontSize: scale(18) }]}>{label}</Text>
        {hint && <Text style={[styles.settingHint, { fontSize: scale(14) }]}>{hint}</Text>}
      </View>
      {children}
    </View>
  );
}

function SegmentControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { scale } = useFontSize();
  return (
    <View style={styles.segment}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.segOption, opt.value === value && styles.segOptionActive]}
          onPress={() => onChange(opt.value)}
          accessibilityRole="radio"
          accessibilityState={{ selected: opt.value === value }}
        >
          <Text style={[
            styles.segText,
            { fontSize: scale(14) },
            opt.value === value && styles.segTextActive,
          ]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/** Tolerance for floating-point voice speed comparison */
const SPEED_COMPARISON_THRESHOLD = 0.05;

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { scale } = useFontSize();
  const { settings, updateSettings, resetProgress } = useAppStore();
  const { changeLanguage } = useAppSettings();
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const fontSizeOptions: { value: FontSizeLevel; label: string }[] = [
    { value: 'normal', label: t('settings.fontSizes.normal') },
    { value: 'large', label: t('settings.fontSizes.large') },
    { value: 'extraLarge', label: t('settings.fontSizes.extraLarge') },
  ];

  const aiProviderOptions: { value: AIProviderType; label: string }[] = [
    { value: 'local', label: t('settings.aiProviders.local') },
    { value: 'baidu', label: t('settings.aiProviders.baidu') },
    { value: 'tongyi', label: t('settings.aiProviders.tongyi') },
    { value: 'openai', label: t('settings.aiProviders.openai') },
  ];

  const speechProviderOptions: { value: SpeechProviderType; label: string }[] = [
    { value: 'device', label: t('settings.speechProviders.device') },
    { value: 'baidu', label: t('settings.speechProviders.baidu') },
  ];

  const handleSave = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    Alert.alert(
      t('settings.resetProgress'),
      t('settings.resetConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.confirm'), style: 'destructive', onPress: resetProgress },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { fontSize: scale(30) }]}>{t('settings.title')}</Text>
        </View>

        {/* Language */}
        <Card>
          <Text style={[styles.cardTitle, { fontSize: scale(20) }]}>🌐 {t('settings.language')}</Text>
          <View style={styles.languageButtons}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langButton, settings.language === lang.code && styles.langButtonActive]}
                onPress={() => changeLanguage(lang.code)}
                accessibilityRole="radio"
                accessibilityState={{ selected: settings.language === lang.code }}
              >
                <Text style={[styles.langText, { fontSize: scale(18) }, settings.language === lang.code && styles.langTextActive]}>
                  {lang.nativeLabel}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Display */}
        <Card>
          <Text style={[styles.cardTitle, { fontSize: scale(20) }]}>🔤 {t('settings.fontSize')}</Text>
          <SegmentControl
            options={fontSizeOptions}
            value={settings.fontSize}
            onChange={(v) => updateSettings({ fontSize: v })}
          />
          <SettingRow label={t('settings.highContrast')}>
            <Switch
              value={settings.highContrast}
              onValueChange={(v) => updateSettings({ highContrast: v })}
              trackColor={{ false: Colors.border, true: Colors.primary }}
            />
          </SettingRow>
        </Card>

        {/* Feedback */}
        <Card>
          <Text style={[styles.cardTitle, { fontSize: scale(20) }]}>🔔 Feedback</Text>
          <SettingRow label={t('settings.vibration')}>
            <Switch
              value={settings.vibration}
              onValueChange={(v) => updateSettings({ vibration: v })}
              trackColor={{ false: Colors.border, true: Colors.primary }}
            />
          </SettingRow>
          <SettingRow label={t('settings.sound')}>
            <Switch
              value={settings.sound}
              onValueChange={(v) => updateSettings({ sound: v })}
              trackColor={{ false: Colors.border, true: Colors.primary }}
            />
          </SettingRow>
        </Card>

        {/* Voice Speed */}
        <Card>
          <Text style={[styles.cardTitle, { fontSize: scale(20) }]}>🔊 {t('settings.voiceSpeed')}</Text>
          <View style={styles.speedButtons}>
            {([0.5, 0.8, 1.0] as const).map((speed, i) => {
              const labels = [t('settings.slow'), t('settings.normal'), t('settings.fast')];
              return (
                <TouchableOpacity
                  key={speed}
                  style={[styles.speedButton, Math.abs(settings.voiceSpeed - speed) < SPEED_COMPARISON_THRESHOLD && styles.speedButtonActive]}
                  onPress={() => updateSettings({ voiceSpeed: speed })}
                >
                  <Text style={[styles.speedText, { fontSize: scale(16) }]}>{labels[i]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* AI Provider */}
        <Card>
          <Text style={[styles.cardTitle, { fontSize: scale(20) }]}>🤖 {t('settings.aiProvider')}</Text>
          <SegmentControl
            options={aiProviderOptions}
            value={settings.aiProvider}
            onChange={(v) => updateSettings({ aiProvider: v })}
          />
          {settings.aiProvider !== 'local' && (
            <View style={styles.apiSection}>
              <Text style={[styles.settingLabel, { fontSize: scale(16) }]}>{t('settings.apiKey')}</Text>
              <TextInput
                style={[styles.textInput, { fontSize: scale(16) }]}
                value={settings.aiApiKey}
                onChangeText={(v) => updateSettings({ aiApiKey: v })}
                placeholder={t('settings.apiKeyPlaceholder')}
                secureTextEntry={!showApiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {settings.aiProvider === 'baidu' && (
                <TextInput
                  style={[styles.textInput, { fontSize: scale(16), marginTop: 8 }]}
                  value={settings.aiApiSecret}
                  onChangeText={(v) => updateSettings({ aiApiSecret: v })}
                  placeholder="API Secret"
                  secureTextEntry={!showApiKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
              <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)}>
                <Text style={[styles.toggleText, { fontSize: scale(14) }]}>
                  {showApiKey ? '🙈 Hide' : '👁️ Show'}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.settingHint, { fontSize: scale(13) }]}>{t('settings.apiKeyHelp')}</Text>
            </View>
          )}
        </Card>

        {/* Speech Provider */}
        <Card>
          <Text style={[styles.cardTitle, { fontSize: scale(20) }]}>🎙️ {t('settings.speechProvider')}</Text>
          <SegmentControl
            options={speechProviderOptions}
            value={settings.speechProvider}
            onChange={(v) => updateSettings({ speechProvider: v })}
          />
        </Card>

        {/* Therapeutic Mode */}
        <Card>
          <Text style={[styles.cardTitle, { fontSize: scale(20) }]}>🏥 {t('settings.therapeuticMode')}</Text>
          <SettingRow label={t('settings.therapeuticMode')} hint={t('settings.therapeuticModeDesc')}>
            <Switch
              value={settings.therapeuticMode}
              onValueChange={(v) => updateSettings({ therapeuticMode: v })}
              trackColor={{ false: Colors.border, true: Colors.primary }}
            />
          </SettingRow>
        </Card>

        {/* About & Reset */}
        <Card>
          <Text style={[styles.cardTitle, { fontSize: scale(20) }]}>ℹ️ {t('settings.about')}</Text>
          <Text style={[styles.versionText, { fontSize: scale(16) }]}>
            {t('settings.version')}: {Constants.expoConfig?.version || '1.0.0'}
          </Text>
          <Text style={[styles.aboutText, { fontSize: scale(14) }]}>
            Speak Again — Built with ❤️ for stroke recovery patients.
          </Text>
        </Card>

        <BigButton
          title={saved ? `✅ ${t('settings.saved')}` : t('settings.save')}
          onPress={handleSave}
          variant={saved ? 'success' : 'primary'}
          size="xlarge"
          fullWidth
          style={{ marginBottom: 12 }}
        />

        <BigButton
          title={t('settings.resetProgress')}
          onPress={handleReset}
          variant="danger"
          size="large"
          fullWidth
          style={{ marginBottom: 32 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingBottom: 32 },
  header: { paddingVertical: 16 },
  title: { fontWeight: '800', color: Colors.text },
  cardTitle: { fontWeight: '700', color: Colors.text, marginBottom: 16 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 8,
  },
  settingLabel: { fontWeight: '600', color: Colors.text },
  settingHint: { color: Colors.textSecondary, marginTop: 2 },
  languageButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  langButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  langButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  langText: { fontWeight: '600', color: Colors.text },
  langTextActive: { color: Colors.primaryDark },
  segment: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  segOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    flex: 1,
    alignItems: 'center',
  },
  segOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  segText: { fontWeight: '600', color: Colors.textSecondary },
  segTextActive: { color: Colors.primaryDark },
  apiSection: { marginTop: 12 },
  textInput: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.text,
    backgroundColor: Colors.surface,
    fontFamily: 'monospace',
  },
  toggleText: { color: Colors.primary, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  speedButtons: { flexDirection: 'row', gap: 8 },
  speedButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  speedButtonActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  speedText: { fontWeight: '700', color: Colors.text },
  versionText: { color: Colors.textSecondary, marginBottom: 8 },
  aboutText: { color: Colors.textSecondary, lineHeight: 20 },
});
