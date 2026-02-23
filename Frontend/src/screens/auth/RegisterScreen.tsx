import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useAuth } from '../../hooks/useAuth';
import { AuthStackParamList } from '../../app/navigation/types';
import { EMAIL_REGEX, SPACE, vh } from '../../utils/constants';
import { THEME } from '../../theme/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const {
    state: { user },
    setProfile,
  } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  const canContinue = useMemo(() => {
    return Boolean(name.trim()) && EMAIL_REGEX.test(email.trim().toLowerCase());
  }, [name, email]);

  const handleNext = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    let hasError = false;

    if (!trimmedName) {
      setNameError('Name is required');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError('Enter a valid email');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (hasError) {
      return;
    }

    await setProfile({ name: trimmedName, email: trimmedEmail });
    console.log('good luck');
    navigation.navigate('PassportUpload');
  };

  return (
    <ScreenContainer
      keyboardAware
      contentStyle={[
        styles.container,
        {
          gap: SPACE.lg,
        },
      ]}
    >
      <View style={[styles.header, { gap: SPACE.xl }]}>
        <Image
          source={require('../../assets/cyberyan-splash.webp')}
          style={styles.heroPlaceholder}
          resizeMode="contain"
        />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Complete the details below using your real information to create your
          account.
        </Text>
      </View>

      <View style={[styles.formSection, { gap: SPACE.sm }]}>
        <AppInput
          autoCapitalize="words"
          error={nameError}
          label="Name"
          onChangeText={setName}
          placeholder="Your full name"
          returnKeyType="next"
          value={name}
        />

        <AppInput
          autoCapitalize="none"
          error={emailError}
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="your@email.com"
          returnKeyType="done"
          value={email}
        />

        <View style={styles.actionContainer}>
          <AppButton disabled={!canContinue} onPress={handleNext} title="Next" />
        </View>
      </View>
    </ScreenContainer>
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: SPACE.xs,
  },
  heroPlaceholder: {
    width: '100%',
    height: vh(0.4),
   // borderRadius: vw(0.03),
   // backgroundColor: '#0F2B3C',
  },
  formSection: {
    width: '100%', 
  },
  title: {
    color: THEME.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: -SPACE.xs,
  },
  subtitle: {
    color: THEME.textSecondary,
    fontSize: 13,
    lineHeight: 22,
    marginTop: -SPACE.md,
    textAlign: 'center',
    width:'90%',
    alignSelf:'center'
  },
  actionContainer: {
    width: '100%',
    marginTop: SPACE.md,
    justifyContent: 'flex-end',
    marginBottom: SPACE.xxl * 2 + SPACE.md,
  },
});
