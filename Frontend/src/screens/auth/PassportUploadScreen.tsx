import React, { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthBottomActionButton } from '../../components/common/AuthBottomActionButton';
import { AuthStepHeader } from '../../components/common/AuthStepHeader';
import { RemovableImagePreview } from '../../components/common/RemovableImagePreview';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AuthStackParamList } from '../../app/navigation/types';
import { useIdentity } from '../../hooks/useIdentity';
import { ensureMediaAndCameraPermissions } from '../../services/permissions/media.permissions';
import { BORDER_RADIUS, SPACE, vh } from '../../utils/constants';
import { THEME } from '../../theme/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'PassportUpload'>;

export const PassportUploadScreen: React.FC<Props> = ({ navigation }) => {
  const {
    state: { passportImageUri },
    setPassportImage,
  } = useIdentity();
  const [isPicking, setIsPicking] = useState(false);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Register');
  };

  const handleSelectImage = async () => {
    const isGranted = await ensureMediaAndCameraPermissions();

    if (!isGranted) {
      Alert.alert(
        'Permission needed',
        'Camera and gallery permissions are required for identity verification.',
      );
      return;
    }

    setIsPicking(true);
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: false,
      });

      if (result.assets?.[0]?.uri) {
        setPassportImage(result.assets[0].uri);
      }
    } finally {
      setIsPicking(false);
    }
  };

  const handlePrimaryAction = () => {
    if (passportImageUri) {
      navigation.navigate('SelfieCapture');
      return;
    }

    handleSelectImage().catch(() => {
      Alert.alert(
        'Upload error',
        'Unable to open gallery right now. Please try again.',
      );
    });
  };

  const handleRemovePassport = () => {
    setPassportImage(null);
  };

  return (
    <ScreenContainer
      contentStyle={[
        styles.container,
        {
          gap: SPACE.lg,
        },
      ]}
    >
      <AuthStepHeader title="Upload Passport" onBackPress={handleBack} />

      <View style={styles.body}>
        <View style={styles.previewContainer}>
          {passportImageUri ? (
            <RemovableImagePreview
              onRemove={handleRemovePassport}
              uri={passportImageUri}
            />
          ) : (
            <Image
              source={require('../../assets/passport-img.webp')}
              style={styles.placeholderImage}
           
            />
          )}
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>Upload Passport</Text>
          <Text style={styles.subtitle}>
            Select a clear passport photo from your gallery.
          </Text>
          <Text style={styles.subtitle}>
            To verify your identity, upload your passport image.
          </Text>
        </View>
        <AuthBottomActionButton
          isSelectionPending={!passportImageUri}
          loading={isPicking}
          onPress={handlePrimaryAction}
          title={passportImageUri ? 'Next' : 'Select from gallery'}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    color: THEME.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACE.xs,
  },
  subtitle: {
    color: THEME.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: -SPACE.xs,
  },
  textBlock: {
    gap: SPACE.xs,
    //backgroundColor:'red',
    alignItems: 'center',
    justifyContent: 'center',
    height: vh(0.15),
    marginTop: SPACE.md,
  },
  previewContainer: {
    height: vh(0.52),
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: THEME.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

