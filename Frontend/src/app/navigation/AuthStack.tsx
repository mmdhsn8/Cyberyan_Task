import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RegisterScreen } from '../../screens/auth/RegisterScreen';
import { PassportUploadScreen } from '../../screens/auth/PassportUploadScreen';
import { SelfieCaptureScreen } from '../../screens/auth/SelfieCaptureScreen';
import { ConfirmScreen } from '../../screens/auth/ConfirmScreen';
import { AuthStackParamList } from './types';
import { useAuth } from '../../hooks/useAuth';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack: React.FC = () => {
  const {
    state: { user },
  } = useAuth();
  const hasCompleteProfile = Boolean(user?.name?.trim() && user?.email?.trim());
  const initialRouteName: keyof AuthStackParamList = hasCompleteProfile
    ? 'PassportUpload'
    : 'Register';

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="PassportUpload" component={PassportUploadScreen} />
      <Stack.Screen name="SelfieCapture" component={SelfieCaptureScreen} />
      <Stack.Screen name="Confirm" component={ConfirmScreen} />
    </Stack.Navigator>
  );
};
