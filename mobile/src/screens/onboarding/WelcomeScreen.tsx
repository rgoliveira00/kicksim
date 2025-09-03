import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import { spacing, borderRadius } from '@/constants/theme';

type WelcomeScreenNavigationProp = StackNavigationProp<OnboardingStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();

  const handleGetStarted = () => {
    navigation.navigate('Features');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Logo and App Name */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.logoText, { color: theme.colors.onPrimary }]}>
              M
            </Text>
          </View>
          <Text variant="headlineLarge" style={[styles.appName, { color: theme.colors.onBackground }]}>
            Marketplace
          </Text>
          <Text variant="bodyLarge" style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}>
            Your one-stop shop for everything
          </Text>
        </View>

        {/* Features Preview */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: theme.colors.primaryContainer }]}>
              <Icon name="shopping" size={32} color={theme.colors.primary} />
            </View>
            <Text variant="titleMedium" style={[styles.featureTitle, { color: theme.colors.onBackground }]}>
              Shop with Confidence
            </Text>
            <Text variant="bodyMedium" style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
              Browse thousands of products from trusted sellers
            </Text>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: theme.colors.secondaryContainer }]}>
              <Icon name="shield-check" size={32} color={theme.colors.secondary} />
            </View>
            <Text variant="titleMedium" style={[styles.featureTitle, { color: theme.colors.onBackground }]}>
              Secure Payments
            </Text>
            <Text variant="bodyMedium" style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
              Your transactions are protected with bank-level security
            </Text>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: theme.colors.tertiaryContainer }]}>
              <Icon name="truck-delivery" size={32} color={theme.colors.tertiary} />
            </View>
            <Text variant="titleMedium" style={[styles.featureTitle, { color: theme.colors.onBackground }]}>
              Fast Delivery
            </Text>
            <Text variant="bodyMedium" style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
              Get your orders delivered quickly to your doorstep
            </Text>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleGetStarted}
            style={[styles.getStartedButton, { backgroundColor: theme.colors.primary }]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Get Started
          </Button>
          
          <Text variant="bodySmall" style={[styles.disclaimer, { color: theme.colors.onSurfaceVariant }]}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  appName: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '700',
  },
  tagline: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  features: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  featureItem: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  featureIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureTitle: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  featureDescription: {
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingBottom: spacing.lg,
  },
  getStartedButton: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
});

