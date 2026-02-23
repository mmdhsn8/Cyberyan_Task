import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/common/AppButton';
import { CustomBottomTab } from '../../components/common/CustomBottomTab';
import { MockBackendBadge } from '../../components/common/MockBackendBadge';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { QRModal } from '../../components/qr/QRModal';
import { AppStackParamList } from '../../app/navigation/types';
import { useIdentity } from '../../hooks/useIdentity';
import { buildQrPayload, formatMaskedValue } from '../../utils/formatters';
import { BORDER_RADIUS, SPACE, vh, vw } from '../../utils/constants';
import { THEME } from '../../theme/tokens';

type Props = NativeStackScreenProps<AppStackParamList, 'Wallet'>;

export const WalletScreen: React.FC<Props> = ({ navigation }) => {
  const {
    state: { did, vc, issuanceSource },
  } = useIdentity();
  const [isQrVisible, setIsQrVisible] = useState(false);
  const [isDidRevealed, setIsDidRevealed] = useState(false);
  const hasDid = Boolean(did);
  const hasVc = Boolean(vc);

  useEffect(() => {
    setIsDidRevealed(false);
  }, [did]);

  const qrPayload = useMemo(() => {
    return buildQrPayload(did, vc);
  }, [did, vc]);

  const completionPercent = useMemo(() => {
    let value = 0;

    if (hasDid) {
      value += 50;
    }

    if (hasVc) {
      value += 50;
    }

    return value;
  }, [hasDid, hasVc]);

  const statusItems = useMemo(() => {
    return [
      {
        key: 'did',
        label: 'DID',
        value: hasDid ? 'Issued' : 'Pending',
        active: hasDid,
      },
      {
        key: 'vc',
        label: 'Credential',
        value: hasVc ? 'Ready' : 'Pending',
        active: hasVc,
      },
    ];
  }, [hasDid, hasVc]);

  const issuedDisplay = useMemo(() => {
    if (!vc?.issuanceDate) {
      return '-';
    }

    const issuedDate = new Date(vc.issuanceDate);
    if (Number.isNaN(issuedDate.getTime())) {
      return vc.issuanceDate;
    }

    return issuedDate.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
  }, [vc?.issuanceDate]);

  return (
    <ScreenContainer
      contentStyle={[
        styles.container,
        styles.noBottomPadding,
      ]}
    >
      <View style={styles.layout}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.scrollArea}
        >
          <View style={styles.mainContent}>
            {issuanceSource === 'mock' ? <MockBackendBadge /> : null}
            <LinearGradient
              colors={['#1E2B30', '#12171A']}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={styles.heroCard}
            >
              <View style={styles.heroAccent} />

              <View style={styles.heroHeader}>
                <Text style={styles.heroEyebrow}>Decentralized Identity</Text>
                <Text style={styles.title}>Identity Wallet</Text>
                <Text style={styles.subtitle}>View and manage your DID and verifiable credentials.</Text>
              </View>

              <View style={styles.statusRow}>
                {statusItems.map(item => {
                  return (
                    <View
                      key={item.key}
                      style={[
                        styles.statusBadge,
                        item.active ? styles.statusBadgeActive : styles.statusBadgeInactive,
                      ]}
                    >
                      <Text style={styles.statusLabel}>{item.label}</Text>
                      <Text
                        style={[
                          styles.statusValue,
                          item.active ? styles.statusValueActive : styles.statusValueInactive,
                        ]}
                      >
                        {item.value}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.progressBlock}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Wallet completion</Text>
                  <Text style={styles.progressValue}>{completionPercent}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${completionPercent}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <Pressable
                disabled={!did}
                onPress={() => setIsDidRevealed(prev => !prev)}
                style={styles.didInfoCard}
              >
                <Text style={styles.didInfoTitle}>Decentralized Identifier</Text>
                <Text numberOfLines={1} style={styles.didInfoValue}>
                  {did ? (isDidRevealed ? did : formatMaskedValue(did)) : 'Not issued yet'}
                </Text>
                {did && !isDidRevealed ? (
                  <Text numberOfLines={1} style={styles.didInfoMasked}>
                    Tap to reveal
                  </Text>
                ) : null}
              </Pressable>

              <View style={styles.vcInfoCard}>
                <Text style={styles.vcInfoTitle}>Verifiable Credentials</Text>
                <View style={styles.vcInfoLine}>
                  <Text style={styles.vcInfoLabel}>Issuer</Text>
                  <Text numberOfLines={1} style={styles.vcInfoValue}>
                    {vc?.issuer ?? '-'}
                  </Text>
                </View>
                <View style={styles.vcInfoLine}>
                  <Text style={styles.vcInfoLabel}>Type</Text>
                  <Text numberOfLines={1} style={styles.vcInfoValue}>
                    {vc?.type?.length ? vc.type.join(', ') : '-'}
                  </Text>
                </View>
                <View style={styles.vcInfoLine}>
                  <Text style={styles.vcInfoLabel}>Subject</Text>
                  <Text numberOfLines={1} style={styles.vcInfoValue}>
                    {vc?.credentialSubject?.id ?? '-'}
                  </Text>
                </View>
                <View style={styles.vcInfoLine}>
                  <Text style={styles.vcInfoLabel}>Issued</Text>
                  <Text numberOfLines={1} style={styles.vcInfoValue}>
                    {issuedDisplay}
                  </Text>
                </View>
              </View>
              <AppButton
                disabled={!did || !vc}
                onPress={() => setIsQrVisible(true)}
                style={styles.qrButton}
                title="View QR Code"
                titleStyle={styles.qrButtonTitle}
              />
            </LinearGradient>
          </View>
        </ScrollView>

        <CustomBottomTab
          activeTab="Wallet"
          onTabPress={tab => {
            if (tab !== 'Wallet') {
              navigation.navigate(tab);
            }
          }}
        />
      </View>

      <QRModal
        onClose={() => setIsQrVisible(false)}
        value={qrPayload}
        visible={isQrVisible}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noBottomPadding: {
    paddingBottom: 0,
  },
  layout: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACE.xs,
  },
  mainContent: {
    gap: SPACE.sm,
  },
  heroCard: {
    position: 'relative',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(88, 230, 217, 0.25)',
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.md,
    gap: SPACE.md,
    overflow: 'hidden',
  },
  heroAccent: {
    position: 'absolute',
    width: vw(0.36),
    height: vw(0.36),
    borderRadius: 999,
    right: -vw(0.08),
    top: -vw(0.1),
    backgroundColor: 'rgba(88, 230, 217, 0.08)',
  },
  heroHeader: {
    gap: SPACE.xs,
  },
  heroEyebrow: {
    color: 'rgba(255, 255, 255, 0.64)',
    fontSize: 11,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  title: {
    color: THEME.textPrimary,
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 13,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    gap: SPACE.xs,
  },
  statusBadge: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.sm,
    gap: SPACE.xxs,
  },
  statusBadgeActive: {
    borderColor: 'rgba(88, 230, 217, 0.5)',
    backgroundColor: 'rgba(88, 230, 217, 0.12)',
  },
  statusBadgeInactive: {
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  statusLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusValueActive: {
    color: THEME.accent,
  },
  statusValueInactive: {
    color: THEME.textSecondary,
  },
  progressBlock: {
    gap: SPACE.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: 'rgba(255, 255, 255, 0.76)',
    fontSize: 12,
    fontWeight: '600',
  },
  progressValue: {
    color: THEME.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: vh(0.009),
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: THEME.accent,
  },
  didInfoCard: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.sm,
    gap: SPACE.xxs,
  },
  didInfoTitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    alignSelf:'center',
    textTransform: 'uppercase',
  },
  didInfoValue: {
    color: THEME.accent,
    fontSize: 13,
    alignSelf: 'center',
    marginTop: SPACE.xxs,
    fontWeight: '700',
  },
  didInfoMasked: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 12,
    alignSelf: 'center',
    fontWeight: '500',
  },
  vcInfoCard: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.sm,
    gap: SPACE.xs,
  },
  vcInfoTitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 14,
    fontWeight: '700',
    alignSelf: 'center',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  vcInfoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACE.xs,
    marginTop: SPACE.xxs,
  },
  vcInfoLabel: {
    color: THEME.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  vcInfoValue: {
    color: THEME.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  
    textAlign: 'right',
  },
  qrButton: {
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACE.xs,
  },
  qrButtonTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
});




