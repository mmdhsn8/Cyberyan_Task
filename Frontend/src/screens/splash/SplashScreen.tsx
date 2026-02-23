import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { DotIndicator } from 'react-native-indicators';
import { SPACE } from '../../utils/constants';
import { THEME } from '../../theme/tokens';

interface SplashScreenProps {
  onFinish?: () => void;
}

const SPLASH_TIMEOUT_MS = 2000;

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish?.();
    }, SPLASH_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/cyberyan-splash.webp')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <View style={styles.footer}>
        <Text style={styles.loadingText}>loading cyberyan task</Text>
        <DotIndicator color={THEME.accent} size={8} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACE.sm,
  },
  image: {
    width: '92%',
    height: '100%',
  },
  footer: {
    width: '100%',
    height:'10%',
   // backgroundColor:'red',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: SPACE.sm,
    paddingHorizontal: SPACE.md,
    marginTop:'-15%'
  },
  loadingText: {
    color: THEME.textSecondary,
    fontSize: 20,
    lineHeight: 20,
    fontWeight: '600',
    marginBottom: SPACE.xs,
  },
});



