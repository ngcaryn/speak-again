import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, Vibration, Platform } from 'react-native';
import { Colors } from '../../constants/colors';
import { useFontSize } from '../../hooks/useFontSize';
import { useAppStore } from '../../store/appStore';

interface BigButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  disabled?: boolean;
  loading?: boolean;
  emoji?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function BigButton({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  emoji,
  style,
  textStyle,
  fullWidth = false,
}: BigButtonProps) {
  const { scale } = useFontSize();
  const { settings } = useAppStore();

  const handlePress = () => {
    if (settings.vibration) {
      Vibration.vibrate(50);
    }
    onPress();
  };

  const buttonSizes = {
    small: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, minHeight: 48 },
    medium: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 16, minHeight: 56 },
    large: { paddingVertical: 18, paddingHorizontal: 36, borderRadius: 20, minHeight: 64 },
    xlarge: { paddingVertical: 22, paddingHorizontal: 40, borderRadius: 24, minHeight: 80 },
  };

  const textSizes = {
    small: scale(16),
    medium: scale(18),
    large: scale(22),
    xlarge: scale(26),
  };

  const variants = {
    primary: {
      backgroundColor: disabled ? Colors.disabled : Colors.primary,
      borderColor: 'transparent',
      borderWidth: 0,
      textColor: Colors.buttonText,
    },
    secondary: {
      backgroundColor: disabled ? Colors.disabled : Colors.secondary,
      borderColor: 'transparent',
      borderWidth: 0,
      textColor: Colors.buttonText,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: disabled ? Colors.disabled : Colors.primary,
      borderWidth: 2,
      textColor: disabled ? Colors.disabled : Colors.primary,
    },
    danger: {
      backgroundColor: disabled ? Colors.disabled : Colors.error,
      borderColor: 'transparent',
      borderWidth: 0,
      textColor: Colors.buttonText,
    },
    success: {
      backgroundColor: disabled ? Colors.disabled : Colors.success,
      borderColor: 'transparent',
      borderWidth: 0,
      textColor: Colors.buttonText,
    },
  };

  const variantStyle = variants[variant];
  const sizeStyle = buttonSizes[size];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.button,
        sizeStyle,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          borderWidth: variantStyle.borderWidth,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.textColor} size="small" />
      ) : (
        <Text style={[
          styles.text,
          { fontSize: textSizes[size], color: variantStyle.textColor },
          textStyle,
        ]}>
          {emoji ? `${emoji} ${title}` : title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
