import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export function Card({ children, style, onPress, elevated = true, padding = 'large' }: CardProps) {
  const paddingValues = {
    none: 0,
    small: 12,
    medium: 16,
    large: 20,
  };

  const content = (
    <View style={[
      styles.card,
      elevated && styles.elevated,
      { padding: paddingValues[padding] },
      style,
    ]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} accessibilityRole="button">
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginBottom: 12,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
