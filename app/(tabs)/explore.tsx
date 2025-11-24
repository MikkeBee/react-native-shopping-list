/**
 * Settings Screen
 * 
 * Allows users to customize app theme with preset themes or custom colors.
 */

import { ThemePresets } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { useSettings } from '@/hooks/use-settings';
import { ThemePresetId } from '@/types';
import { lightImpact, notifySuccess } from '@/utils/haptics';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { themeId, isLoading, updateTheme, resetToDefault } = useSettings();
  const [isChanging, setIsChanging] = useState(false);

  /**
   * Handle theme selection
   */
  const handleThemeSelect = async (newThemeId: ThemePresetId) => {
    if (newThemeId === themeId || newThemeId === 'custom') {
      return;
    }

    await lightImpact();
    
    try {
      setIsChanging(true);
      await updateTheme(newThemeId);
      await notifySuccess();
    } catch (error) {
      console.error('Failed to update theme:', error);
      Alert.alert('Error', 'Failed to update theme. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsChanging(false);
    }
  };

  /**
   * Handle reset to default
   */
  const handleReset = async () => {
    await lightImpact();
    
    Alert.alert(
      'Reset Theme',
      'Are you sure you want to reset to the default theme?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsChanging(true);
              await resetToDefault();
              await notifySuccess();
            } catch (error) {
              console.error('Failed to reset theme:', error);
              Alert.alert('Error', 'Failed to reset theme. Please try again.', [{ text: 'OK' }]);
            } finally {
              setIsChanging(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Customize your app appearance
          </Text>
        </View>

        {/* Preset Themes Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preset Themes</Text>
          <Text style={[styles.sectionDescription, { color: colors.muted }]}>
            Choose from our curated theme presets
          </Text>

          <View style={styles.themesGrid}>
            {(Object.keys(ThemePresets) as ThemePresetId[])
              .filter(id => id !== 'custom')
              .map(presetId => {
                const preset = ThemePresets[presetId];
                const isSelected = themeId === presetId;

                return (
                  <Pressable
                    key={presetId}
                    onPress={() => handleThemeSelect(presetId)}
                    disabled={isChanging || isSelected}
                    style={({ pressed }) => [
                      styles.themeCard,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: isSelected ? colors.tint : colors.cardBorder,
                        borderWidth: isSelected ? 2 : 1,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    {/* Theme Preview Colors */}
                    <View style={styles.themePreview}>
                      <View
                        style={[
                          styles.previewColor,
                          { backgroundColor: preset.light.tint },
                        ]}
                      />
                      <View
                        style={[
                          styles.previewColor,
                          { backgroundColor: preset.light.cardBackground },
                        ]}
                      />
                      <View
                        style={[
                          styles.previewColor,
                          { backgroundColor: preset.dark.tint },
                        ]}
                      />
                    </View>

                    {/* Theme Info */}
                    <Text style={[styles.themeName, { color: colors.text }]}>
                      {preset.name}
                    </Text>
                    <Text style={[styles.themeDescription, { color: colors.muted }]} numberOfLines={2}>
                      {preset.description}
                    </Text>

                    {isSelected && (
                      <View style={[styles.selectedBadge, { backgroundColor: colors.tint }]}>
                        <Text style={styles.selectedText}>✓ Active</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
          </View>
        </View>

        {/* Custom Colors Section (Coming Soon) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Custom Colors</Text>
          <Text style={[styles.sectionDescription, { color: colors.muted }]}>
            Create your own color scheme (coming soon)
          </Text>
          
          <View
            style={[
              styles.comingSoonCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.comingSoonText, { color: colors.muted }]}>
              🎨 Custom color picker will be available in the next update
            </Text>
          </View>
        </View>

        {/* Reset Button */}
        {themeId !== 'default' && (
          <View style={styles.section}>
            <Pressable
              onPress={handleReset}
              disabled={isChanging}
              style={({ pressed }) => [
                styles.resetButton,
                {
                  backgroundColor: colors.danger,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              {isChanging ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.resetButtonText}>Reset to Default Theme</Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  themesGrid: {
    gap: 12,
  },
  themeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  themePreview: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  previewColor: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  themeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  selectedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  comingSoonCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 14,
    textAlign: 'center',
  },
  resetButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
