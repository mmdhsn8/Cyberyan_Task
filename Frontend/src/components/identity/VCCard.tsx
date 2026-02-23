import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VerifiableCredential } from '../../types/identity.types';
import { BORDER_RADIUS, SPACE } from '../../utils/constants';
import { THEME } from '../../theme/tokens';

interface VCCardProps {
  vc: VerifiableCredential | null;
}

export const VCCard: React.FC<VCCardProps> = ({ vc }) => {
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
      <Text style={styles.title}>Verifiable Credential (VC)</Text>
      <Text style={styles.line}>
        Issuer: <Text style={styles.value}>{vc?.issuer ?? '-'}</Text>
      </Text>
      <Text style={styles.line}>
        Type: <Text style={styles.value}>{vc?.type.join(', ') ?? '-'}</Text>
      </Text>
      <Text style={styles.line}>
        Subject: <Text style={styles.value}>{vc?.credentialSubject.id ?? '-'}</Text>
      </Text>
      <Text style={styles.line}>
        Issued: <Text style={styles.value}>{vc?.issuanceDate ?? '-'}</Text>
      </Text>
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
    marginBottom: 2,
  },
  line: {
    color: THEME.textSecondary,
    fontSize: 12,
  },
  value: {
    color: THEME.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});



