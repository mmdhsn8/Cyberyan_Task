import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { BORDER_RADIUS, vh } from '../../utils/constants';
import { THEME } from '../../theme/tokens';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  activityIndicatorColor?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  titleStyle,
  activityIndicatorColor = THEME.background,
}) => {
  const verticalPadding = vh(0.018);
  const canPress = !disabled && !loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!canPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          paddingVertical: verticalPadding,
          opacity: canPress ? (pressed ? 0.9 : 1) : 0.5,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={activityIndicatorColor} />
      ) : (
        <Text style={[styles.title, titleStyle]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: THEME.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: THEME.background,
    fontSize: 16,
    fontWeight: '700',
  },
});



