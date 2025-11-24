/**
 * ListCard Component
 * 
 * Displays a shopping list card with swipe-to-delete (iOS) and long-press (Android).
 */

import { useTheme } from '@/contexts/theme-context';
import { ShoppingList } from '@/types';
import { heavyImpact, notifyError } from '@/utils/haptics';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

interface ListCardProps {
  /** The shopping list to display */
  list: ShoppingList;
  
  /** Callback when card is pressed */
  onPress: (list: ShoppingList) => void;
  
  /** Callback when delete is confirmed */
  onDelete: (id: string) => void;
  
  /** Optional item count to display */
  itemCount?: number;
}

export function ListCard({ list, onPress, onDelete, itemCount }: ListCardProps) {
  const { colors } = useTheme();

  /**
   * Handle delete with confirmation dialog
   */
  const handleDelete = async () => {
    await heavyImpact();
    
    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${list.name}"? This will also delete all items in this list.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await notifyError();
            onDelete(list.id);
          },
        },
      ]
    );
  };

  /**
   * Handle long press (both iOS and Android)
   */
  const handleLongPress = () => {
    handleDelete();
  };

  return (
    <Pressable
      onPress={() => onPress(list)}
      onLongPress={handleLongPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[styles.name, { color: colors.text }]}
            numberOfLines={1}
          >
            {list.name}
          </Text>
          {itemCount !== undefined && (
            <View style={[styles.badge, { backgroundColor: colors.tint }]}>
              <Text style={styles.badgeText}>{itemCount}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.date, { color: colors.muted }]}>
          {formatDate(list.createdAt)}
        </Text>
      </View>
      
      {/* Show long-press hint for both platforms */}
      <Text style={[styles.hint, { color: colors.subtle }]}>
        Long press to delete
      </Text>
    </Pressable>
  );
}

/**
 * Format timestamp to readable date
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  content: {
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
  },
  hint: {
    fontSize: 12,
    marginTop: 8,
  },
});
