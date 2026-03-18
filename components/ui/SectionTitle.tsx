import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { useFontSize } from '../../hooks/useFontSize';

interface SectionTitleProps {
  text: string;
  style?: TextStyle;
  level?: 'h1' | 'h2' | 'h3';
}

export function SectionTitle({ text, style, level = 'h2' }: SectionTitleProps) {
  const { scale } = useFontSize();

  const sizes = {
    h1: scale(30),
    h2: scale(24),
    h3: scale(20),
  };

  return (
    <Text style={[styles.title, { fontSize: sizes[level] }, style]} accessibilityRole="header">
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
});
