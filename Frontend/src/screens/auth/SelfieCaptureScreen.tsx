import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { AuthBottomActionButton } from '../../components/common/AuthBottomActionButton';
import { AuthStepHeader } from '../../components/common/AuthStepHeader';
import { RemovableImagePreview } from '../../components/common/RemovableImagePreview';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AuthStackParamList } from '../../app/navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useIdentity } from '../../hooks/useIdentity';
import { checkMediaAndCameraPermissions } from '../../services/permissions/media.permissions';
import { BORDER_RADIUS, SPACE, vh } from '../../utils/constants';
import { THEME } from '../../theme/tokens';
 
type Props = NativeStackScreenProps<AuthStackParamList, 'SelfieCapture'>;
const INITIAL_COUNTDOWN = 5;

export const SelfieCaptureScreen: React.FC<Props> = ({ navigation }) => {
  const isFocused = useIsFocused();
  const cameraRef = useRef<Camera>(null);
  const frontDevice = useCameraDevice('front');
  const {
    state: { user },
  } = useAuth();
  const {
    state: { passportImageUri, selfieImageUri },
    setSelfieImage,
  } = useIdentity();
  const [hasPermission, setHasPermission] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(INITIAL_COUNTDOWN);
  const isCountdownActive =
    countdown !== null && hasPermission && Boolean(frontDevice) && !selfieImageUri;

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('PassportUpload');
  };

  useEffect(() => {
    const syncPermission = async () => {
      const isGranted = await checkMediaAndCameraPermissions();
      if (isGranted) {
        setHasPermission(true);
        return;
      }

      setHasPermission(false);
      Alert.alert(
        'Permission needed',
        'Please allow camera and gallery permissions to continue.',
      );
    };

    syncPermission().catch(() => {
      Alert.alert(
        'Camera error',
        'Unable to initialize camera permission. Please try again.',
      );
    });
  }, []);

  useEffect(() => {
    if (!hasPermission || !frontDevice || !isFocused || selfieImageUri) {
      return;
    }

    setCountdown(INITIAL_COUNTDOWN);

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null) {
          return null;
        }

        if (prev === 0) {
          clearInterval(timer);
          return null;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [frontDevice, hasPermission, isFocused, selfieImageUri]);

  const handleCapture = async () => {
    if (!cameraRef.current) {
      return;
    }

    setSubmitError(null);
    setIsCapturing(true);
    let capturedUri: string | null = null;
    try {
      const photo = await cameraRef.current.takePhoto();
      capturedUri = photo.path.startsWith('file://')
        ? photo.path
        : `file://${photo.path}`;
      setSelfieImage(capturedUri);
    } finally {
      setIsCapturing(false);
    }

    if (capturedUri) {
      await handlePrepareIdentity(capturedUri);
    }
  };

  const handlePrepareIdentity = async (capturedSelfieUri?: string) => {
    setSubmitError(null);
    const resolvedSelfieImageUri = capturedSelfieUri ?? selfieImageUri;

    if (!user?.name || !user.email) {
      setSubmitError('Profile is incomplete. Please return and fill your details.');
      return;
    }

    if (!passportImageUri || !resolvedSelfieImageUri) {
      setSubmitError('Passport and selfie are required before registration.');
      return;
    }

    setIsSubmitting(true);
    try {
      navigation.navigate('Confirm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrimaryAction = () => {
    if (selfieImageUri) {
      handlePrepareIdentity(selfieImageUri);
      return;
    }

    handleCapture().catch(() => {
      Alert.alert(
        'Camera error',
        'Unable to capture selfie right now. Please try again.',
      );
    });
  };

  const handleRemoveSelfie = () => {
    setSubmitError(null);
    setSelfieImage(null);
    setCountdown(INITIAL_COUNTDOWN);
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
      <AuthStepHeader title="Capture Selfie" onBackPress={handleBack} />

      <View style={styles.body}>
        <View style={styles.previewContainer}>
          {!hasPermission ? (
            <Text
              style={[
                styles.placeholderText,
                {
                  paddingHorizontal: SPACE.md,
                },
              ]}
            >
              Waiting for camera permission...
            </Text>
          ) : selfieImageUri ? (
            <RemovableImagePreview
              onRemove={handleRemoveSelfie}
              uri={selfieImageUri}
            />
          ) : frontDevice ? (
            isCountdownActive ? (
              <View style={styles.countdownBlock}>
                <Text style={styles.countdownText}>{countdown}</Text>
                <Text style={styles.countdownHint}>Get ready, camera opens in a moment</Text>
              </View>
            ) : (
              <Camera
                ref={cameraRef}
                device={frontDevice}
                isActive={isFocused}
                photo
                style={StyleSheet.absoluteFill}
              />
            )
          ) : (
            <Text
              style={[
                styles.placeholderText,
                {
                  paddingHorizontal: SPACE.md,
                },
              ]}
            >
              No front camera available
            </Text>
          )}
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title}>Capture Selfie</Text>
          <Text style={styles.subtitle}>
            Use front camera to take a clear selfie.
          </Text>
          <Text style={styles.subtitle}>
            To verify your identity, capture a clear selfie.
          </Text>
          {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
        </View>

        <AuthBottomActionButton
          disabled={
            (!selfieImageUri && (!hasPermission || !frontDevice || isCountdownActive)) ||
            isSubmitting
          }
          isSelectionPending={!selfieImageUri}
          loading={isCapturing || (!selfieImageUri && isCountdownActive) || isSubmitting}
          onPress={handlePrimaryAction}
          title={selfieImageUri ? 'Next' : 'Capture Selfie'}
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
  placeholderText: {
    color: THEME.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  countdownText: {
    color: THEME.textPrimary,
    fontSize: vh(0.12),
    fontWeight: '700',
    lineHeight: vh(0.14),
    textAlign: 'center',
  },
  countdownBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACE.xs,
  },
  countdownHint: {
    color: THEME.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF8C8C',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: SPACE.xs,
  },
});



