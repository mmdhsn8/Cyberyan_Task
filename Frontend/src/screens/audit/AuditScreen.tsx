import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../app/navigation/types';
import { CustomBottomTab } from '../../components/common/CustomBottomTab';
import { MockBackendBadge } from '../../components/common/MockBackendBadge';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useIdentity } from '../../hooks/useIdentity';
import { BORDER_RADIUS, SPACE, vh, vw } from '../../utils/constants';
import { THEME } from '../../theme/tokens';
import { formatTimestamp } from '../../utils/formatters';

type Props = NativeStackScreenProps<AppStackParamList, 'Audit'>;

export const AuditScreen: React.FC<Props> = ({ navigation }) => {
  const {
    state: { did, auditTrail, issuanceSource },
  } = useIdentity();
  const hasDid = Boolean(did);

  const records = useMemo(() => {
    return auditTrail;
  }, [auditTrail]);

  const statusItems = useMemo(() => {
    return [
      {
        key: 'records',
        label: 'Records',
        value: records.length.toString(),
        active: records.length > 0,
      },
      {
        key: 'did',
        label: 'DID',
        value: hasDid ? 'Linked' : 'Missing',
        active: hasDid,
      },
    ];
  }, [hasDid, records.length]);

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
                <Text style={styles.heroEyebrow}>Identity Verification</Text>
                <Text style={styles.title}>Audit Trail</Text>
                <Text style={styles.subtitle}>
                  SHA-256 hash, action, and timestamp records.
                </Text>
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
            </LinearGradient>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Record Timeline</Text>
              </View>

              <View style={styles.recordsList}>
                {records.length > 0 ? (
                  records.map((item, index) => {
                    return (
                      <View key={item.id} style={styles.recordCard}>
                        <View style={styles.recordTopRow}>
                          <Text style={styles.recordLabel}>Hash</Text>
                          <Text style={styles.recordIndex}>#{index + 1}</Text>
                        </View>

                        <Text style={styles.hashValue}>{item.hash}</Text>

                        <View style={styles.recordMetaRow}>
                          <Text style={styles.metaLabel}>Action</Text>
                          <Text numberOfLines={1} style={styles.metaValue}>
                            {item.action}
                          </Text>
                        </View>

                        <View style={styles.recordMetaRow}>
                          <Text style={styles.metaLabel}>Timestamp</Text>
                          <Text numberOfLines={1} style={styles.metaValue}>
                            {formatTimestamp(item.timestamp)}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.recordCard}>
                    <Text style={styles.metaValueLeft}>
                      No audit record yet. Complete identity confirmation first.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        <CustomBottomTab
          activeTab="Audit"
          onTabPress={tab => {
            if (tab !== 'Audit') {
              navigation.navigate(tab);
            }
          }}
        />
      </View>
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  didInfoValue: {
    color: THEME.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  didInfoMasked: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    gap: SPACE.xs,
  },
  sectionHeader: {
    gap: SPACE.xxs,
    marginTop: SPACE.md,
  },
  sectionTitle: {
    color: THEME.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: THEME.textSecondary,
    fontSize: 12,
  },
  recordsList: {
    gap: SPACE.sm,
    marginTop: SPACE.xs,
  },
  recordCard: {
    width: '100%',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.surface,
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.md,
    gap: SPACE.xs,
  },
  recordTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordLabel: {
    color: THEME.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  recordIndex: {
    color: THEME.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  hashValue: {
    color: THEME.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  recordMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACE.xs,
  },
  metaLabel: {
    color: THEME.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  metaValue: {
    color: THEME.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  metaValueLeft: {
    color: THEME.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'left',
  },
});



