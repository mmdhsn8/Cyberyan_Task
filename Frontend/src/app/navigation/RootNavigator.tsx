import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../../screens/splash/SplashScreen';
import { useAuth } from '../../hooks/useAuth';
import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';
import { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const {
    state: { token, isBootstrapping },
  } = useAuth();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const isNavigationReadyRef = useRef(false);
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  const targetRouteName = useMemo<keyof RootStackParamList>(() => {
    if (isBootstrapping || !isSplashFinished) {
      return 'Splash';
    }

    return token ? 'App' : 'Auth';
  }, [isBootstrapping, isSplashFinished, token]);

  const handleSplashFinish = useCallback(() => {
    setIsSplashFinished(true);
  }, []);

  const syncRootRoute = useCallback(() => {
    if (!isNavigationReadyRef.current) {
      return;
    }

    const currentRouteName = navigationRef.getCurrentRoute()?.name;
    if (currentRouteName === targetRouteName) {
      return;
    }

    // Reset avoids back-navigation into a stale auth/app flow after state changes.
    navigationRef.reset({
      index: 0,
      routes: [{ name: targetRouteName }],
    });
  }, [navigationRef, targetRouteName]);

  useEffect(() => {
    syncRootRoute();
  }, [syncRootRoute]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        isNavigationReadyRef.current = true;
        syncRootRoute();
      }}
    >
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Splash">
          {() => <SplashScreen onFinish={handleSplashFinish} />}
        </RootStack.Screen>
        <RootStack.Screen name="Auth" component={AuthStack} />
        <RootStack.Screen name="App" component={AppStack} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
