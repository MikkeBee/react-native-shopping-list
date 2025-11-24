/**
 * List Detail Screen
 * 
 * Displays items for a specific shopping list with add/edit/copy/delete functionality.
 */

import { EmptyState } from '@/components/shopping/empty-state/empty-state';
import { ListItem } from '@/components/shopping/list-item/list-item';
import { useTheme } from '@/contexts/theme-context';
import { useShoppingItems } from '@/hooks/use-shopping-items';
import * as ShoppingListsService from '@/services/shopping-lists.service';
import { lightImpact, notifySuccess } from '@/utils/haptics';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  
  const { items, isLoading, error, createItem, updateItem, copyItem, toggleComplete, deleteItem, refresh } = useShoppingItems(id || '');
  
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [listName, setListName] = useState<string>('Shopping List');
  const inputRef = useRef<TextInput>(null);

  /**
   * Fetch list details to get the name for the header
   */
  useEffect(() => {
    const fetchListName = async () => {
      if (!id) return;
      
      try {
        const list = await ShoppingListsService.getById(id);
        if (list) {
          setListName(list.name);
        }
      } catch (error) {
        console.error('Failed to fetch list name:', error);
      }
    };
    
    fetchListName();
  }, [id]);

  /**
   * Refresh items when screen comes into focus
   */
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  /**
   * Handle create item button press
   */
  const handleCreateItem = async () => {
    await lightImpact();
    
    if (Platform.OS === 'ios') {
      // iOS: Use Alert.prompt
      Alert.prompt(
        'New Item',
        'Enter the item text',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Add',
            onPress: async (text?: string) => {
              if (!text?.trim()) {
                return;
              }
              
              try {
                setIsCreating(true);
                await createItem({ listId: id || '', text: text.trim() });
                await notifySuccess();
              } catch {
                Alert.alert(
                  'Error',
                  'Failed to create item. Please try again.',
                  [{ text: 'OK' }]
                );
              } finally {
                setIsCreating(false);
              }
            },
          },
        ],
        'plain-text',
        '',
        'default'
      );
    } else {
      // Android: Use custom modal
      setNewItemText('');
      setShowCreateModal(true);
    }
  };

  /**
   * Handle modal shown - focus input to show keyboard
   */
  const handleModalShow = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  /**
   * Handle create item submission from modal (Android)
   */
  const handleCreateSubmit = async () => {
    if (!newItemText.trim()) {
      setShowCreateModal(false);
      return;
    }
    
    try {
      setIsCreating(true);
      setShowCreateModal(false);
      await createItem({ listId: id || '', text: newItemText.trim() });
      await notifySuccess();
      setNewItemText('');
    } catch {
      Alert.alert(
        'Error',
        'Failed to create item. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Handle edit item
   */
  const handleEditItem = async (itemId: string, text: string) => {
    await updateItem(itemId, { text });
    await notifySuccess();
  };

  /**
   * Handle toggle item completion
   */
  const handleToggleComplete = async (itemId: string) => {
    await toggleComplete(itemId);
  };

  /**
   * Handle copy item
   */
  const handleCopyItem = async (itemId: string) => {
    await copyItem(itemId);
    await notifySuccess();
  };

  /**
   * Handle delete item
   */
  const handleDeleteItem = async (itemId: string) => {
    await deleteItem(itemId);
    await notifySuccess();
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: listName }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading items...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: listName }} />
        <EmptyState
          icon="⚠️"
          title="Something went wrong"
          message={error.message}
          action={
            <Pressable
              onPress={refresh}
              style={[styles.button, { backgroundColor: colors.tint }]}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>
          }
        />
      </SafeAreaView>
    );
  }

  /**
   * Render empty state
   */
  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: listName }} />
        <EmptyState
          icon="🛒"
          title="No items yet"
          message="Add your first item to this shopping list."
          action={
            <Pressable
              onPress={handleCreateItem}
              disabled={isCreating}
              style={[styles.button, { backgroundColor: colors.tint }]}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Add Item</Text>
              )}
            </Pressable>
          }
        />
        
        {/* Floating Action Button */}
        <Pressable
          onPress={handleCreateItem}
          disabled={isCreating}
          style={({ pressed }) => [
            styles.fab,
            { 
              backgroundColor: colors.tint,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.fabText}>+</Text>
          )}
        </Pressable>

        {/* Create Item Modal (Android) */}
        <Modal
          visible={showCreateModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCreateModal(false)}
          onShow={handleModalShow}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowCreateModal(false)}
          >
            <Pressable 
              style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                New Item
              </Text>
              <Text style={[styles.modalLabel, { color: colors.muted }]}>
                Enter the item text
              </Text>
              <TextInput
                ref={inputRef}
                style={[
                  styles.modalInput,
                  { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.cardBorder,
                  }
                ]}
                value={newItemText}
                onChangeText={setNewItemText}
                placeholder="Item text"
                placeholderTextColor={colors.muted}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreateSubmit}
                autoComplete="off"
                autoCorrect={false}
                spellCheck={false}
              />
              <View style={styles.modalButtons}>
                <Pressable
                  onPress={() => setShowCreateModal(false)}
                  style={[styles.modalButton, { backgroundColor: colors.cardBorder }]}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleCreateSubmit}
                  style={[styles.modalButton, { backgroundColor: colors.tint }]}
                >
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                    Add
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    );
  }

  /**
   * Render items list
   */
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: listName }} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {/* Items List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItem
            item={item}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditItem}
            onCopy={handleCopyItem}
            onDelete={handleDeleteItem}
          />
        )}
        contentContainerStyle={styles.listContent}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
      />

      {/* Floating Action Button */}
      <Pressable
        onPress={handleCreateItem}
        disabled={isCreating}
        style={({ pressed }) => [
          styles.fab,
          { 
            backgroundColor: colors.tint,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        {isCreating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.fabText}>+</Text>
        )}
      </Pressable>

      {/* Create Item Modal (Android) */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowCreateModal(false)}
        >
          <Pressable 
            style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              New Item
            </Text>
            <Text style={[styles.modalLabel, { color: colors.muted }]}>
              Enter the item text
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.cardBorder,
                }
              ]}
              value={newItemText}
              onChangeText={setNewItemText}
              placeholder="Item text"
              placeholderTextColor={colors.muted}
              autoFocus
              showSoftInputOnFocus={true}
              keyboardType="default"
              returnKeyType="done"
              onSubmitEditing={handleCreateSubmit}
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowCreateModal(false)}
                style={[styles.modalButton, { backgroundColor: colors.cardBorder }]}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleCreateSubmit}
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                  Add
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  subtitle: {
    fontSize: 14,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 100, // Account for FAB (80px) + tab bar (50px) + margin
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
