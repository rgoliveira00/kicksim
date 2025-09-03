import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
  HelperText,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { login, clearError, selectAuthLoading, selectAuthError, selectLoginAttempts } from '@/store/slices/authSlice';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { spacing, borderRadius } from '@/constants/theme';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const loginAttempts = useAppSelector(selectLoginAttempts);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Validate password
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Handle login
  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    // Check for too many login attempts
    if (loginAttempts >= 5) {
      Alert.alert(
        'Too Many Attempts',
        'You have made too many login attempts. Please try again later.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await dispatch(login({ email: email.toLowerCase().trim(), password })).unwrap();
      // Navigation will be handled automatically by AppNavigator
    } catch (error: any) {
      // Error is handled by the slice and displayed in the UI
      console.error('Login failed:', error);
    }
  };

  // Handle social login (placeholder)
  const handleSocialLogin = (provider: string) => {
    Alert.alert(
      'Coming Soon',
      `${provider} login will be available in a future update.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo/Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.logoText, { color: theme.colors.onPrimary }]}>
                M
              </Text>
            </View>
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
              Welcome Back
            </Text>
            <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Sign in to your marketplace account
            </Text>
          </View>

          {/* Login Form */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardContent}>
              {/* Email Input */}
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                onBlur={() => validateEmail(email)}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                error={!!emailError}
                disabled={isLoading}
                left={<TextInput.Icon icon="email-outline" />}
                style={styles.input}
              />
              <HelperText type="error" visible={!!emailError}>
                {emailError}
              </HelperText>

              {/* Password Input */}
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                onBlur={() => validatePassword(password)}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoComplete="password"
                textContentType="password"
                error={!!passwordError}
                disabled={isLoading}
                left={<TextInput.Icon icon="lock-outline" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
              />
              <HelperText type="error" visible={!!passwordError}>
                {passwordError}
              </HelperText>

              {/* General Error */}
              {error && (
                <HelperText type="error" visible={true} style={styles.generalError}>
                  {error}
                </HelperText>
              )}

              {/* Forgot Password Link */}
              <Button
                mode="text"
                onPress={() => navigation.navigate('ForgotPassword')}
                disabled={isLoading}
                style={styles.forgotPassword}
              >
                Forgot Password?
              </Button>

              {/* Login Button */}
              <Button
                mode="contained"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading || !email || !password}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
              >
                Sign In
              </Button>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <Divider style={styles.divider} />
                <Text variant="bodySmall" style={[styles.dividerText, { color: theme.colors.onSurfaceVariant }]}>
                  or continue with
                </Text>
                <Divider style={styles.divider} />
              </View>

              {/* Social Login Buttons */}
              <View style={styles.socialButtons}>
                <Button
                  mode="outlined"
                  onPress={() => handleSocialLogin('Google')}
                  disabled={isLoading}
                  style={styles.socialButton}
                  icon={() => <Icon name="google" size={20} color={theme.colors.onSurface} />}
                >
                  Google
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleSocialLogin('Apple')}
                  disabled={isLoading}
                  style={styles.socialButton}
                  icon={() => <Icon name="apple" size={20} color={theme.colors.onSurface} />}
                >
                  Apple
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Don't have an account?{' '}
            </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              disabled={isLoading}
              compact
            >
              Sign Up
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
  },
  card: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  cardContent: {
    padding: spacing.lg,
  },
  input: {
    marginBottom: spacing.xs,
  },
  generalError: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
  },
  loginButton: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    marginHorizontal: spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  socialButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
});

