import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import onboarding screens
import { WelcomeScreen } from '@/screens/onboarding/WelcomeScreen';
import { FeaturesScreen } from '@/screens/onboarding/FeaturesScreen';
import { PermissionsScreen } from '@/screens/onboarding/PermissionsScreen';
import { NotificationsScreen } from '@/screens/onboarding/NotificationsScreen';

// Navigation types
export type OnboardingStackParamList = {
  Welcome: undefined;
  Features: undefined;
  Permissions: undefined;
  Notifications: undefined;
};

const Stack = createStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Prevent swiping back during onboarding
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          title: 'Welcome',
        }}
      />
      
      <Stack.Screen
        name="Features"
        component={FeaturesScreen}
        options={{
          title: 'Features',
        }}
      />
      
      <Stack.Screen
        name="Permissions"
        component={PermissionsScreen}
        options={{
          title: 'Permissions',
        }}
      />
      
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
        }}
      />
    </Stack.Navigator>
  );
};

