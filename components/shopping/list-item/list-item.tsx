/**
 * ListItem Component
 * 
 * Displays a shopping item with inline editing and action buttons.
 */

import { useTheme } from '@/contexts/theme-context';
import { ShoppingItem } from '@/types';
import { lightImpact, mediumImpact } from '@/utils/haptics';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface ListItemProps {
  /** The shopping item to display */
  item: ShoppingItem;
  
  /** Callback when item completion is toggled */
  onToggleComplete: (id: string) => Promise<void>;
  
  /** Callback when item is edited */
  onEdit: (id: string, text: string) => Promise<void>;
  
  /** Callback when item is copied */
  onCopy: (id: string) => Promise<void>;
  
  /** Callback when item is deleted */
  onDelete: (id: string) => Promise<void>;
}

export function ListItem({ item, onToggleComplete, onEdit, onCopy, onDelete }: ListItemProps) {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);

  /**
   * Handle toggle completion
   */
  const handleToggleComplete = async () => {
    await lightImpact();
    
    try {
      await onToggleComplete(item.id);
    } catch {
      Alert.alert('Error', 'Failed to update item. Please try again.', [{ text: 'OK' }]);
    }
  };

  /**
   * Handle edit button press
   */
  const handleEditPress = async () => {
    await mediumImpact();
    setEditText(item.text);
    setIsEditing(true);
  };

  /**
   * Handle save edit
   */
  const handleSave = async () => {
    const trimmed = editText.trim();
    
    if (!trimmed) {
      Alert.alert('Error', 'Item text cannot be empty', [{ text: 'OK' }]);
      setEditText(item.text);
      return;
    }
    
    if (trimmed === item.text) {
      setIsEditing(false);
      return;
    }
    
    try {
      await onEdit(item.id, trimmed);
      setIsEditing(false);
    } catch {
      Alert.alert('Error', 'Failed to update item. Please try again.', [{ text: 'OK' }]);
      setEditText(item.text);
    }
  };

  /**
   * Handle cancel edit
   */
  const handleCancel = () => {
    setEditText(item.text);
    setIsEditing(false);
  };

  /**
   * Handle copy button press
   */
  const handleCopy = async () => {
    await mediumImpact();
    
    try {
      await onCopy(item.id);
    } catch {
      Alert.alert('Error', 'Failed to copy item. Please try again.', [{ text: 'OK' }]);
    }
  };

  /**
   * Handle delete button press
   */
  const handleDelete = async () => {
    await mediumImpact();
    
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.text}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDelete(item.id);
            } catch {
              Alert.alert('Error', 'Failed to delete item. Please try again.', [{ text: 'OK' }]);
            }
          },
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      {isEditing ? (
        // Edit mode
        <View style={styles.editContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.cardBorder,
              },
            ]}
            value={editText}
            onChangeText={setEditText}
            autoFocus
            showSoftInputOnFocus={true}
            keyboardType="default"
            returnKeyType="done"
            onSubmitEditing={handleSave}
            placeholder="Item text"
            placeholderTextColor={colors.muted}
          />
          <View style={styles.editActions}>
            <Pressable
              onPress={handleCancel}
              style={[styles.editButton, { backgroundColor: colors.cardBorder }]}
            >
              <Text style={[styles.editButtonText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={[styles.editButton, { backgroundColor: colors.tint }]}
            >
              <Text style={[styles.editButtonText, { color: '#fff' }]}>Save</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        // Display mode
        <>
          {/* Completion checkbox and text - tappable to toggle */}
          <Pressable
            onPress={handleToggleComplete}
            style={({ pressed }) => [
              styles.contentContainer,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            {/* Checkbox */}
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: item.completed ? colors.completedColor : colors.cardBorder,
                  backgroundColor: item.completed ? colors.completedColor : 'transparent',
                },
              ]}
            >
              {item.completed && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            
            {/* Item text */}
            <Text
              style={[
                styles.text,
                {
                  color: item.completed ? colors.completedColor : colors.text,
                  textDecorationLine: item.completed ? 'line-through' : 'none',
                  opacity: item.completed ? 0.6 : 1,
                },
              ]}
              numberOfLines={2}
            >
              {item.text}
            </Text>
          </Pressable>
          
          <View style={styles.actions}>
            <Pressable
              onPress={handleEditPress}
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Text style={[styles.actionText, { color: colors.tint }]}>Edit</Text>
            </Pressable>
            
            <Pressable
              onPress={handleCopy}
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Text style={[styles.actionText, { color: colors.tint }]}>Copy</Text>
            </Pressable>
            
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    flex: 1,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editContainer: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
