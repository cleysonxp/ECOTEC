import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Vibração curta para confirmar um toque (ignorada onde não existir). */
export function toqueLeve() {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

export function toqueDeSucesso() {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}
