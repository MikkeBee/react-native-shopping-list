/**
 * EmptyState Component
 * 
 * Displays a user-friendly message when no data is available.
 * Supports light and dark mode theming.
 */

import { useTheme } from '@/contexts/theme-context';
import { StyleSheet, Text, View } from 'react-native';

interface EmptyStateProps {
  /** Icon name or emoji to display */
  icon?: string;
  
  /** Primary message to display */
  title: string;
  
  /** Optional secondary message */
  message?: string;
  
  /** Optional action button */
  action?: React.ReactNode;
}

export function EmptyState({ icon = '📝', title, message, action }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      {message && (
        <Text style={[styles.message, { color: colors.muted }]}>
          {message}
        </Text>
      )}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  action: {
    marginTop: 8,
  },
});
