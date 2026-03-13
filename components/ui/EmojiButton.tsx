import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, Vibration } from 'react-native';
import { Colors } from '../../constants/colors';
import { useAppStore } from '../../store/appStore';
import { useFontSize } from '../../hooks/useFontSize';

interface EmojiButtonProps {
  emoji: string;
  label: string;
  onPress: () => void;
  selected?: boolean;
  size?: number;
  style?: ViewStyle;
  disabled?: boolean;
}

export function EmojiButton({ emoji, label, onPress, selected = false, size = 80, style, disabled = false }: EmojiButtonProps) {
  const { settings } = useAppStore();
  const { scale } = useFontSize();

  const handlePress = () => {
    if (settings.vibration) Vibration.vibrate(50);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[
        styles.button,
        { width: size, height: size + 30, borderRadius: 16 },
        selected && styles.selected,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
    >
      <Text style={[styles.emoji, { fontSize: size * 0.45 }]}>{emoji}</Text>
      <Text style={[styles.label, { fontSize: scale(13) }]} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 4,
  },
  selected: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  emoji: {
    marginBottom: 4,
  },
  label: {
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
});
