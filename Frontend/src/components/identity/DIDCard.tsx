import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BORDER_RADIUS, SPACE } from '../../utils/constants';
import { THEME } from '../../theme/tokens';
import { formatMaskedValue } from '../../utils/formatters';

interface DIDCardProps {
  did: string | null;
}

export const DIDCard: React.FC<DIDCardProps> = ({ did }) => {
  return (
    <View
      style={[
        styles.card,
        {
          gap: SPACE.xs,
          paddingHorizontal: SPACE.md,
          paddingVertical: SPACE.md,
        },
      ]}
    >
      <Text style={styles.title}>Decentralized Identifier (DID)</Text>
      <Text style={styles.value}>{did ?? 'Not issued yet'}</Text>
      {did ? <Text style={styles.masked}>{formatMaskedValue(did)}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: BORDER_RADIUS.lg,
    borderColor: THEME.border,
    borderWidth: 1,
    backgroundColor: THEME.surface,
  },
  title: {
    color: THEME.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  value: {
    color: THEME.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  masked: {
    color: THEME.textSecondary,
    fontSize: 12,
  },
});



