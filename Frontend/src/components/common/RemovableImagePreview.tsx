import React from 'react';
import {
  Image,
  ImageStyle,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { BORDER_RADIUS, SPACE, vh, vw } from '../../utils/constants';
import { THEME } from '../../theme/tokens';

type Props = {
  uri: string;
  onRemove: () => void;
  removeLabel?: string;
  imageStyle?: StyleProp<ImageStyle>;
  removeButtonStyle?: StyleProp<ViewStyle>;
  removeButtonTextStyle?: StyleProp<TextStyle>;
};

export const RemovableImagePreview: React.FC<Props> = ({
  uri,
  onRemove,
  removeLabel = 'Remove',
  imageStyle,
  removeButtonStyle,
  removeButtonTextStyle,
}) => {
  return (
    <>
      <Image source={{ uri }} style={[styles.image, imageStyle]} />
      <Pressable
        accessibilityLabel={removeLabel}
        accessibilityRole="button"
        onPress={onRemove}
        style={({ pressed }) => [
          styles.removeButton,
          pressed && styles.removeButtonPressed,
          removeButtonStyle,
        ]}
      >
        <Text style={[styles.removeButtonText, removeButtonTextStyle]}>
          {removeLabel}
        </Text>
      </Pressable>
    </>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '95%',
    height: '45%',
    borderRadius: BORDER_RADIUS.lg,
  },
  removeButton: {
    position: 'absolute',
    top: vh(0.015),
    right: vw(0.03),
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xs,
  },
  removeButtonPressed: {
    opacity: 0.8,
  },
  removeButtonText: {
    color: THEME.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});

