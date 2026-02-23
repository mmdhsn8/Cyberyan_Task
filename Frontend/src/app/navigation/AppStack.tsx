import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalletScreen } from '../../screens/wallet/WalletScreen';
import { AuditScreen } from '../../screens/audit/AuditScreen';
import { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Wallet"
      screenOptions={{ headerShown: false, animation: 'none' }}
    >
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="Audit" component={AuditScreen} />
    </Stack.Navigator>
  );
};
