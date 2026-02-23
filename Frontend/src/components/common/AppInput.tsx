import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { BORDER_RADIUS, vh, vw } from '../../utils/constants';
import { THEME } from '../../theme/tokens';

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const AppInput: React.FC<AppInputProps> = ({ label, error, ...props }) => {
  const containerGap = vh(0.008);
  const verticalPadding = vh(0.016);
  const horizontalPadding = vw(0.035);

  return (
    <View style={[styles.container, { gap: containerGap }]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={THEME.textSecondary}
        style={[
          styles.input,
          {
            paddingVertical: verticalPadding,
            paddingHorizontal: horizontalPadding,
          },
        ]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color: THEME.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: THEME.surface,
    color: THEME.textPrimary,
    fontSize: 15,
  },
  error: {
    color: THEME.danger,
    fontSize: 12,
  },
});



