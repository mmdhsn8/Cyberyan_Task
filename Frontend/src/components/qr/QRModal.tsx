import React from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  BackHandler,
  Image,
  Pressable,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {
  BORDER_RADIUS,
  SPACE,
  TAB_ACTIVE_SELECTED_BG,
} from '../../utils/constants';
import { THEME } from '../../theme/tokens';

const CYBERYAN_LOGO = require('../../assets/cyberyan-qr.webp');

interface QRModalProps {
  visible: boolean;
  value: string;
  onClose: () => void;
}

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

export const QRModal: React.FC<QRModalProps> = ({ visible, value, onClose }) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const hasValue = value.trim().length > 0;
  const [copied, setCopied] = React.useState(false);
  const qrValue = hasValue ? value : ' ';
  const panelWidth = Math.min(windowWidth * 0.96, 540);
  const panelHeight = windowHeight * 0.75;
  const modalPadding = Math.min(windowWidth * 0.05, 26);
  const qrPadding = Math.min(windowWidth * 0.04, 16);
  const { qrSize, qrLogoSize, qrLogoPadding } = React.useMemo(() => {
    const isLandscape = windowWidth > windowHeight;
    const shortestSide = Math.min(windowWidth, windowHeight);

    const innerPanelWidth = panelWidth - modalPadding * 2;
    const availableWidth = innerPanelWidth - qrPadding * 2;

    const reservedHeight = isLandscape ? 170 : 240;
    const availableHeight = Math.max(
      180,
      panelHeight - modalPadding * 2 - reservedHeight,
    );

    const targetByViewport = shortestSide * (isLandscape ? 0.6 : 0.74);
    const rawQrSize = Math.min(availableWidth, availableHeight, targetByViewport);
    const adaptiveQrSize = clamp(rawQrSize, 210, isLandscape ? 340 : 430);

    return {
      qrSize: adaptiveQrSize,
      qrLogoSize: clamp(adaptiveQrSize * 0.4, 84, 168),
      qrLogoPadding: clamp(adaptiveQrSize * 0.035, 6, 12),
    };
  }, [modalPadding, panelHeight, panelWidth, qrPadding, windowHeight, windowWidth]);

  const addressPreview = React.useMemo(() => {
    if (!hasValue) {
      return 'No address';
    }

    if (value.length <= 18) {
      return value;
    }

    return `${value.slice(0, 7)}...${value.slice(-7)}`;
  }, [hasValue, value]);

  React.useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });

    return () => subscription.remove();
  }, [onClose, visible]);

  React.useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = React.useCallback(() => {
    if (!hasValue) {
      return;
    }

    Clipboard.setString(value);
    setCopied(true);
  }, [hasValue, value]);

  const handleShare = React.useCallback(async () => {
    if (!hasValue) {
      return;
    }

    try {
      await Share.share({ message: value });
    } catch {
      // Ignore share cancel / platform exceptions.
    }
  }, [hasValue, value]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <Pressable onPress={onClose} style={styles.backdrop} />
      <View
        style={[
          styles.panel,
          {
            gap: SPACE.lg,
            height: panelHeight,
            paddingHorizontal: modalPadding,
            paddingVertical: modalPadding,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Identity</Text>
          <Pressable onPress={onClose} style={styles.topIconButton}>
            <Text style={styles.topIconLabel}>X</Text>
          </Pressable>
        </View>

        <View style={[styles.qrCard, { padding: qrPadding }]}>
          <View style={styles.qrContainer}>
            <QRCode value={qrValue} size={qrSize} />
            <View
              pointerEvents="none"
              style={[
                styles.qrLogoOverlay,
                {
                  width: qrLogoSize,
                  height: qrLogoSize,
                 // borderRadius: qrLogoSize / 2,
                  padding: qrLogoPadding,
                },
              ]}
            >
              <Image
                resizeMode="contain"
                source={CYBERYAN_LOGO}
                style={styles.qrLogoImage}
              />
            </View>
          </View>
        </View>

        <Pressable onPress={handleCopy} style={styles.addressRow}>
          <Text numberOfLines={1} style={styles.addressText}>
            {addressPreview}
          </Text>
          <Text style={styles.addressCopyLabel}>{copied ? 'Copied' : 'Copy'}</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.helperText}>
            Share this code only with trusted verifiers.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              disabled={!hasValue}
              onPress={handleCopy}
              style={[styles.actionButton, !hasValue && styles.actionButtonDisabled]}
            >
              <Text style={styles.actionLabel}>{copied ? 'Copied' : 'Copy address'}</Text>
            </Pressable>
            <Pressable
              disabled={!hasValue}
              onPress={handleShare}
              style={[
                styles.actionButton,
                !hasValue && styles.actionButtonDisabled,
              ]}
            >
              <Text style={styles.actionLabel}>Share</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
   // paddingHorizontal: '1%',
    paddingBottom: 0,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    width: '100%',
    maxWidth: 540,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.background,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: THEME.textPrimary,
    fontSize: 34,
    fontWeight: '700',
  },
  topIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topIconLabel: {
    color: TAB_ACTIVE_SELECTED_BG,
    fontSize: 17,
    fontWeight: '700',
  },
  qrCard: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: BORDER_RADIUS.lg + 2,
    marginTop: SPACE.xxl,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLogoOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  qrLogoImage: {
    width: '100%',
    height: '100%',
  },
  addressRow: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: THEME.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '90%',
  },
  addressText: {
    color: THEME.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  addressCopyLabel: {
    color: THEME.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  helperText: {
    textAlign: 'center',
    color: THEME.textSecondary,
    fontSize: 15,
    lineHeight: 21,
  },
  footer: {
    width: '100%',
    marginTop: 'auto',
    gap: 12,
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md + 2,
    borderWidth: 1,
    borderColor: 'rgba(88, 230, 217, 0.35)',
    backgroundColor: 'rgba(88, 230, 217, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACE.sm,
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionLabel: {
    color: THEME.accent,
    fontSize: 18,
    fontWeight: '700',
  },
});
