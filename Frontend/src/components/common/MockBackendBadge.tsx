import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BORDER_RADIUS, SPACE } from '../../utils/constants';
import { THEME } from '../../theme/tokens';

// baraye fallback dar sorat nabod backend (kept intentionally for fallback UX)
const BADGE_MESSAGE =
  'The backend is off. I show you mocking data now. To see real result, turn on backend.';

export const MockBackendBadge: React.FC = () => {
  return (
    <View style={styles.badge}>
      <Text style={styles.label}>MOCK MODE</Text>
      <Text style={styles.message}>{BADGE_MESSAGE}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#FFB56A',
    backgroundColor: 'rgba(255, 181, 106, 0.14)',
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xs,
    gap: SPACE.xxs,
  },
  label: {
    color: '#FFD9A7',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  message: {
    color: THEME.textPrimary,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
});



