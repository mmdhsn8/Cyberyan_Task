import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  SPACE,
  TAB_ACTIVE_SELECTED_BG,
  TAB_ACTIVE_SELECTED_BORDER,
} from '../../utils/constants';
import { AppButton } from './AppButton';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  isSelectionPending?: boolean;
};

export const AuthBottomActionButton: React.FC<Props> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  isSelectionPending = false,
}) => {
  const buttonStyle = isSelectionPending ? styles.pendingButton : undefined;
  const buttonTitleStyle = isSelectionPending ? styles.pendingButtonTitle : undefined;
  const loadingColor = isSelectionPending ? '#000000' : undefined;

  return (
    <View style={styles.container}>
      <AppButton
        activityIndicatorColor={loadingColor}
        disabled={disabled}
        loading={loading}
        onPress={onPress}
        style={buttonStyle}
        titleStyle={buttonTitleStyle}
        title={title}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: SPACE.xs,
    justifyContent: 'flex-end',
    marginBottom: SPACE.xxl * 2 + SPACE.md,
  },
  pendingButton: {
    backgroundColor: TAB_ACTIVE_SELECTED_BG,
    borderWidth: 1,
    borderColor: TAB_ACTIVE_SELECTED_BORDER,
  },
  pendingButtonTitle: {
    color: '#000000',
  },
});
