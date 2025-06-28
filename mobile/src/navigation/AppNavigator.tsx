import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { selectIsAuthenticated, selectAuthLoading, loadStoredAuth } from '@/store/slices/authSlice';
import { selectOnboarding } from '@/store/slices/appSlice';

// Import navigators
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';

// Import screens
import { LoadingScreen } from '@/components/LoadingScreen';

// Navigation types
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  Loading: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authLoading = useAppSelector(selectAuthLoading);
  const onboarding = useAppSelector(selectOnboarding);

  // Load stored authentication on app start
  useEffect(() => {
    dispatch(loadStoredAuth());
  }, [dispatch]);

  // Show loading screen while checking authentication
  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Disable swipe back for security
      }}
    >
      {!onboarding.completed ? (
        // Show onboarding for new users
        <Stack.Screen
          name="Onboarding"
          component={OnboardingNavigator}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
      ) : !isAuthenticated ? (
        // Show auth screens for unauthenticated users
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
      ) : (
        // Show main app for authenticated users
        <Stack.Screen
          name="Main"
          component={MainNavigator}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
      )}
    </Stack.Navigator>
  );
};

