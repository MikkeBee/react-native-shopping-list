/**
 * Haptic Feedback Utilities
 * 
 * Provides haptic feedback for user interactions following platform conventions.
 * Uses expo-haptics for cross-platform support.
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Light impact feedback
 * 
 * Use for: Button taps, item selection
 */
export async function lightImpact(): Promise<void> {
  try {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    console.warn('[Haptics] Light impact failed:', error);
  }
}

/**
 * Medium impact feedback
 * 
 * Use for: Swipe actions, drag events
 */
export async function mediumImpact(): Promise<void> {
  try {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  } catch (error) {
    console.warn('[Haptics] Medium impact failed:', error);
  }
}

/**
 * Heavy impact feedback
 * 
 * Use for: Delete confirmation, important actions
 */
export async function heavyImpact(): Promise<void> {
  try {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  } catch (error) {
    console.warn('[Haptics] Heavy impact failed:', error);
  }
}

/**
 * Success notification feedback
 * 
 * Use for: Item created, operation completed successfully
 */
export async function notifySuccess(): Promise<void> {
  try {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  } catch (error) {
    console.warn('[Haptics] Success notification failed:', error);
  }
}

/**
 * Warning notification feedback
 * 
 * Use for: Validation errors, warnings
 */
export async function notifyWarning(): Promise<void> {
  try {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  } catch (error) {
    console.warn('[Haptics] Warning notification failed:', error);
  }
}

/**
 * Error notification feedback
 * 
 * Use for: Operation failed, delete action
 */
export async function notifyError(): Promise<void> {
  try {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  } catch (error) {
    console.warn('[Haptics] Error notification failed:', error);
  }
}

/**
 * Selection changed feedback
 * 
 * Use for: Picker/selector value changes
 */
export async function selectionChanged(): Promise<void> {
  try {
    if (Platform.OS === 'ios') {
      await Haptics.selectionAsync();
    } else if (Platform.OS === 'android') {
      // Android doesn't have selection feedback, use light impact instead
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    console.warn('[Haptics] Selection feedback failed:', error);
  }
}
