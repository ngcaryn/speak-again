import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useFontSize } from '../../hooks/useFontSize';

interface StatCardProps {
  emoji?: string;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  value: string | number;
  label: string;
  color?: string;
}

export function StatCard({ emoji, iconName, value, label, color = Colors.primary }: StatCardProps) {
  const { scale } = useFontSize();
  return (
    <View style={[styles.card, { borderTopColor: color, borderTopWidth: 4 }]}>
      {iconName ? (
        <Ionicons name={iconName} size={28} color={color} style={styles.icon} />
      ) : (
        <Text style={styles.emoji}>{emoji}</Text>
      )}
      <Text style={[styles.value, { fontSize: scale(28), color }]}>{value}</Text>
      <Text style={[styles.label, { fontSize: scale(14) }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  icon: {
    marginBottom: 6,
  },
  value: {
    fontWeight: '800',
    marginBottom: 2,
  },
  label: {
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
