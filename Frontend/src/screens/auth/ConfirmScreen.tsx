import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/common/AppButton';
import { AuthStepHeader } from '../../components/common/AuthStepHeader';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AuthStackParamList } from '../../app/navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useIdentity } from '../../hooks/useIdentity';
import {
  fetchIssuanceAuditRecord,
  isAuditServiceUnavailableError,
} from '../../services/api/audit.service';
import {
  isAuthServiceUnavailableError,
  loginUser,
} from '../../services/api/auth.service';
import {
  isIdentityServiceUnavailableError,
  registerIdentity,
} from '../../services/api/identity.service';
import { BORDER_RADIUS, SPACE, vh, vw } from '../../utils/constants';
import { THEME } from '../../theme/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'Confirm'>;

export const ConfirmScreen: React.FC<Props> = ({ navigation }) => {
  const {
    state: { user },
    signIn,
    clearProfileData,
  } = useAuth();
  const {
    state: { passportImageUri, selfieImageUri },
    setIdentityPayload,
    clearTransientIdentityData,
  } = useIdentity();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMedia, setActiveMedia] = useState<'selfie' | 'passport'>('passport');
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('SelfieCapture');
  };

  const canConfirm = useMemo(() => {
    return Boolean(user?.name && user?.email && passportImageUri && selfieImageUri);
  }, [passportImageUri, selfieImageUri, user?.email, user?.name]);
  const canSubmit = canConfirm && hasAcceptedTerms;

  const currentMedia = useMemo(() => {
    const isSelfie = activeMedia === 'selfie';

    return {
      label: isSelfie ? 'Selfie Photo' : 'Passport Photo',
      uri: isSelfie ? selfieImageUri : passportImageUri,
    };
  }, [activeMedia, passportImageUri, selfieImageUri]);

  const handleConfirm = async () => {
    if (!user) {
      Alert.alert('Profile missing', 'Please go back and fill registration details.');
      return;
    }

    if (!passportImageUri || !selfieImageUri) {
      Alert.alert('Missing images', 'Please upload passport and selfie first.');
      return;
    }

    if (!hasAcceptedTerms) {
      Alert.alert(
        'Consent required',
        'Please confirm your information and accept the terms first.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const identityResponse = await registerIdentity({
        name: user.name,
        email: user.email,
        passportImage: passportImageUri,
        selfieImage: selfieImageUri,
      });
      const authResponse = await loginUser(user.email);
      // Audit endpoint requires a valid auth token issued after login.
      const auditRecord = await fetchIssuanceAuditRecord(
        identityResponse.did,
        identityResponse.vc,
        authResponse.token,
      );

      setIdentityPayload({
        did: identityResponse.did,
        vc: identityResponse.vc,
        auditTrail: [auditRecord.record],
        issuanceSource: identityResponse.dataSource,
        pendingAuthToken: authResponse.token,
      });

      // Root navigator reacts to token update and moves user to AppStack.
      await signIn({
        token: authResponse.token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
      await clearProfileData();
      clearTransientIdentityData();
    } catch (error) {
      if (isIdentityServiceUnavailableError(error)) {
        Alert.alert(
          'Service unavailable',
          'Identity service unavailable. Please turn on backend.',
        );
        return;
      }

      if (isAuthServiceUnavailableError(error)) {
        Alert.alert(
          'Service unavailable',
          'Auth service unavailable. Please turn on backend.',
        );
        return;
      }

      if (isAuditServiceUnavailableError(error)) {
        Alert.alert(
          'Service unavailable',
          'Audit service unavailable. Please turn on backend.',
        );
        return;
      }

      Alert.alert(
        'Request failed',
        'Unable to submit confirmation right now. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      scrollable
      contentStyle={[
        styles.container,
        {
          gap: SPACE.lg,
        },
      ]}
    >
      <AuthStepHeader title="Confirm Details" onBackPress={handleBack} />

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Identity Review</Text>
        </View>

        <View style={styles.mediaSection}>
          <View style={styles.mediaFrame}>
            {currentMedia.uri ? (
              <Image
                resizeMode='stretch'
                source={{ uri: currentMedia.uri }}
                style={[
                  styles.mediaImage,
                  activeMedia === 'selfie'
                    ? styles.mediaImageSelfie
                    : styles.mediaImagePassport,
                ]}
              />
            ) : (
              <Text style={styles.placeholderText}>No image</Text>
            )}
          </View>
          <Text style={[styles.sectionLabel, styles.mediaLabelCentered]}>
            {currentMedia.label}
          </Text>
        </View>

        <View style={styles.paginationRow}>
          <Pressable
            accessibilityLabel="Show passport image"
            accessibilityRole="button"
            onPress={() => setActiveMedia('passport')}
            style={styles.paginationButton}
          >
            <View
              style={[
                styles.paginationDot,
                activeMedia === 'passport' && styles.paginationDotActive,
              ]}
            />
          </Pressable>
          <Pressable
            accessibilityLabel="Show selfie image"
            accessibilityRole="button"
            onPress={() => setActiveMedia('selfie')}
            style={styles.paginationButton}
          >
            <View
              style={[
                styles.paginationDot,
                activeMedia === 'selfie' && styles.paginationDotActive,
              ]}
            />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoSection}>
          <Text style={styles.sectionLabel}>Profile Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{user?.name ?? '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email ?? '-'}</Text>
          </View>
          <View style={[styles.divider, styles.consentDivider]} />
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: hasAcceptedTerms }}
            accessibilityLabel="Accept terms and confirm information"
            onPress={() => setHasAcceptedTerms(prev => !prev)}
            style={[
              styles.consentRow,
              hasAcceptedTerms && styles.consentRowChecked,
            ]}
          >
            <View style={styles.consentCopy}>
              <Text style={styles.consentTitle}>Confirmation and Terms</Text>
              <Text style={styles.consentText}>
                I confirm the submitted information is accurate and I accept
                all terms and conditions.
              </Text>
            </View>
            <View
              style={[
                styles.checkboxBase,
                hasAcceptedTerms && styles.checkboxBaseChecked,
              ]}
            >
              {hasAcceptedTerms ? (
                <View style={styles.checkboxInner} />
              ) : null}
            </View>
          </Pressable>
        </View>
      </View>

      <AppButton
        disabled={!canSubmit}
        loading={isSubmitting}
        onPress={handleConfirm}
        title="Confirm"
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  card: {
    width: '100%',
    height: vh(0.71),
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: THEME.surface,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.md,
    gap: SPACE.sm,
  },
  cardHeader: {
    gap: SPACE.xxs,
  },
  cardTitle: {
    color: THEME.textPrimary,
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '700',
  }, 
  mediaSection: {
    width: '100%',
    gap: SPACE.xs,
    marginTop: SPACE.xs,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACE.xs,
  },
  paginationButton: {
    padding: SPACE.xxs,
  },
  paginationDot: {
    width: vw(0.03),
    height: vw(0.03),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: 'transparent',
  },
  paginationDotActive: {
    borderColor: THEME.textPrimary,
    backgroundColor: THEME.textPrimary,
  },
  sectionLabel: {
    color: THEME.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  mediaLabelCentered: {
    textAlign: 'center',
    marginTop: SPACE.xs,
  },
  mediaFrame: {
    width: '100%',
    height: vh(0.25),
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#242424',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mediaImage: {
    width: '100%',
    borderRadius: BORDER_RADIUS.md,
  },
  mediaImageSelfie: {
    height: '100%',
    width: '70%', 
  },
  mediaImagePassport: {
    height:'100%',
    width:'100%'
     
  },
  divider: {
    height: 1,
    backgroundColor: THEME.border,
  },
  infoSection: {
    gap: SPACE.xs,
  },
  consentDivider: {
    marginTop: SPACE.xs,
  },
  consentRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.xs,
    marginTop: SPACE.xxs,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#242424',
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.sm,
  },
  consentRowChecked: {
    borderColor: THEME.accent,
  },
  checkboxBase: {
    width: vw(0.052),
    height: vw(0.052),
    borderRadius: vw(0.008),
    borderWidth: 2,
    borderColor: THEME.textSecondary,
    backgroundColor: '#161616',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBaseChecked: {
    borderColor: THEME.accent,
    backgroundColor: '#132E2B',
  },
  checkboxInner: {
    width: '62%',
    height: '62%',
    borderRadius: vw(0.004),
    backgroundColor: THEME.accent,
  },
  consentCopy: {
    flex: 1,
    gap: SPACE.xxs,
  },
  consentTitle: {
    color: THEME.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  consentText: {
    color: THEME.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'left',
  },
  infoRow: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#242424',
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: THEME.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  infoValue: {
    color: THEME.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
    marginLeft: SPACE.sm,
  },
  placeholderText: {
    color: THEME.textSecondary,
    fontSize: 12,
  },
});

