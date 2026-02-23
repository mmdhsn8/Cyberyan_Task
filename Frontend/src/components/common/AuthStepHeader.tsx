import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { APP_LAYOUT, BORDER_RADIUS, SPACE, vh, vw } from '../../utils/constants';
import { THEME } from '../../theme/tokens';

interface AuthStepHeaderProps {
  title: string;
  onBackPress: () => void;
}

export const AuthStepHeader: React.FC<AuthStepHeaderProps> = ({
  title,
  onBackPress,
}) => {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Go back"
        hitSlop={12}
        onPress={onBackPress}
        style={({ pressed }) => [
          styles.backButton,
          pressed ? styles.backButtonPressed : null,
        ]}
      >
        <Svg
          width={Math.min(vw(0.055), 22)}
          height={Math.min(vw(0.055), 22)}
          viewBox="0 0 24 24"
          fill="none"
        >
          <Path
            d="M15 18L9 12L15 6"
            stroke={THEME.accent}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>
      <View pointerEvents="none" style={styles.titleContainer}>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {title}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: APP_LAYOUT.windowHeight / 18,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingRight: SPACE.sm,
    borderRadius: BORDER_RADIUS.lg,
    zIndex: 10,
    marginBottom: SPACE.xxs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.28,
    shadowRadius: 10,
  },
  titleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACE.xxl * 2 + SPACE.xs,
  },
  headerTitle: {
    color: THEME.textPrimary,
    fontSize: Math.min(vw(0.045), vh(0.024)),
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    zIndex: 2,
    borderRadius: BORDER_RADIUS.md,
    minWidth: vw(0.12),
    height: Math.min(vh(0.054), 48),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACE.sm,
    backgroundColor: THEME.surface,
  },
  backButtonPressed: {
    opacity: 0.9,
  },
});



