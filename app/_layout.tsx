import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from '../store/appStore';
import '../i18n';

export default function RootLayout() {
  const { loadSettings } = useAppStore();

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#4A90D9" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
