/**
 * Shopping Lists Overview Screen
 * 
 * Displays all shopping lists with create and delete functionality.
 */

import { EmptyState } from '@/components/shopping/empty-state/empty-state';
import { ListCard } from '@/components/shopping/list-card/list-card';
import { useTheme } from '@/contexts/theme-context';
import { useShoppingLists } from '@/hooks/use-shopping-lists';
import * as ShoppingItemsService from '@/services/shopping-items.service';
import { ShoppingList } from '@/types';
import { lightImpact, notifySuccess } from '@/utils/haptics';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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

export default function ShoppingListsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { lists, isLoading, error, createList, deleteList, refresh } = useShoppingLists();
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const inputRef = useRef<TextInput>(null);

  /**
   * Fetch item counts for all lists
   */
  useEffect(() => {
    const fetchItemCounts = async () => {
      const counts: Record<string, number> = {};
      
      for (const list of lists) {
        try {
          counts[list.id] = await ShoppingItemsService.countByListId(list.id);
        } catch (error) {
          console.error(`Failed to fetch count for list ${list.id}:`, error);
          counts[list.id] = 0;
        }
      }
      
      setItemCounts(counts);
    };
    
    if (lists.length > 0) {
      fetchItemCounts();
    }
  }, [lists]);

  /**
   * Handle create list button press
   */
  const handleCreateList = async () => {
    await lightImpact();
    
    if (Platform.OS === 'ios') {
      // iOS: Use Alert.prompt
      Alert.prompt(
        'New Shopping List',
        'Enter a name for your shopping list',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Create',
            onPress: async (name?: string) => {
              if (!name?.trim()) {
                return;
              }
              
              try {
                setIsCreating(true);
                await createList({ name: name.trim() });
                await notifySuccess();
              } catch {
                Alert.alert(
                  'Error',
                  'Failed to create shopping list. Please try again.',
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
      setNewListName('');
      setShowCreateModal(true);
    }
  };

  /**
   * Focus input when modal opens
   */
  const handleModalShow = () => {
    // Small delay to ensure modal animation is complete
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  /**
   * Handle create list submission from modal (Android)
   */
  const handleCreateSubmit = async () => {
    if (!newListName.trim()) {
      setShowCreateModal(false);
      return;
    }
    
    try {
      setIsCreating(true);
      setShowCreateModal(false);
      await createList({ name: newListName.trim() });
      await notifySuccess();
      setNewListName('');
    } catch {
      Alert.alert(
        'Error',
        'Failed to create shopping list. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Handle list card press - navigate to list detail
   */
  const handleListPress = (list: ShoppingList) => {
    router.push(`/list/${list.id}` as any);
  };

  /**
   * Handle delete list
   */
  const handleDeleteList = async (id: string) => {
    try {
      await deleteList(id);
    } catch {
      Alert.alert(
        'Error',
        'Failed to delete shopping list. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading your lists...
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
  if (lists.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="📝"
          title="No shopping lists yet"
          message="Create your first shopping list to get started organizing your shopping trips."
          action={
            <Pressable
              onPress={handleCreateList}
              disabled={isCreating}
              style={[styles.button, { backgroundColor: colors.tint }]}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create List</Text>
              )}
            </Pressable>
          }
        />

        {/* Floating Action Button - also show in empty state */}
        <Pressable
          onPress={handleCreateList}
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

        {/* Create List Modal (Android) */}
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
                New Shopping List
              </Text>
              <Text style={[styles.modalLabel, { color: colors.muted }]}>
                Enter a name for your shopping list
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
                value={newListName}
                onChangeText={setNewListName}
                placeholder="Shopping List"
                placeholderTextColor={colors.muted}
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
                    Create
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
   * Render lists
   */
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.title, { color: colors.text }]}>Shopping Lists</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {lists.length} {lists.length === 1 ? 'list' : 'lists'}
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListCard
            list={item}
            onPress={handleListPress}
            onDelete={handleDeleteList}
            itemCount={itemCounts[item.id]}
          />
        )}
        contentContainerStyle={styles.listContent}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={(data, index) => ({
          length: 100, // Approximate item height
          offset: 100 * index,
          index,
        })}
      />

      {/* Floating Action Button */}
      <Pressable
        onPress={handleCreateList}
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

      {/* Create List Modal (Android) */}
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
              New Shopping List
            </Text>
            <Text style={[styles.modalLabel, { color: colors.muted }]}>
              Enter a name for your shopping list
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
              value={newListName}
              onChangeText={setNewListName}
              placeholder="Shopping List"
              placeholderTextColor={colors.muted}
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
                  Create
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
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
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