import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button, useTheme, RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { register, selectAuthLoading, selectAuthError } from '@/store/slices/authSlice';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { spacing, borderRadius } from '@/constants/theme';

type RoleSelectionScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'RoleSelection'>;
type RoleSelectionScreenRouteProp = RouteProp<AuthStackParamList, 'RoleSelection'>;

interface Props {
  navigation: RoleSelectionScreenNavigationProp;
  route: RoleSelectionScreenRouteProp;
}

export const RoleSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller'>('buyer');
  const { email, password, firstName, lastName, phone } = route.params;

  const handleRegister = async () => {
    try {
      await dispatch(register({
        email,
        password,
        firstName,
        lastName,
        phone,
        role: selectedRole,
      })).unwrap();
      // Navigation will be handled automatically by AppNavigator
    } catch (error: any) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
            Choose Your Role
          </Text>
          <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            How do you plan to use our marketplace?
          </Text>
        </View>

        <View style={styles.options}>
          <Card
            style={[
              styles.roleCard,
              { backgroundColor: theme.colors.surface },
              selectedRole === 'buyer' && { borderColor: theme.colors.primary, borderWidth: 2 }
            ]}
            onPress={() => setSelectedRole('buyer')}
          >
            <Card.Content style={styles.roleContent}>
              <RadioButton
                value="buyer"
                status={selectedRole === 'buyer' ? 'checked' : 'unchecked'}
                onPress={() => setSelectedRole('buyer')}
              />
              <View style={styles.roleInfo}>
                <Icon name="shopping" size={32} color={theme.colors.primary} />
                <Text variant="titleLarge" style={styles.roleTitle}>
                  I want to buy
                </Text>
                <Text variant="bodyMedium" style={[styles.roleDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Browse and purchase products from various sellers
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Card
            style={[
              styles.roleCard,
              { backgroundColor: theme.colors.surface },
              selectedRole === 'seller' && { borderColor: theme.colors.primary, borderWidth: 2 }
            ]}
            onPress={() => setSelectedRole('seller')}
          >
            <Card.Content style={styles.roleContent}>
              <RadioButton
                value="seller"
                status={selectedRole === 'seller' ? 'checked' : 'unchecked'}
                onPress={() => setSelectedRole('seller')}
              />
              <View style={styles.roleInfo}>
                <Icon name="store" size={32} color={theme.colors.secondary} />
                <Text variant="titleLarge" style={styles.roleTitle}>
                  I want to sell
                </Text>
                <Text variant="bodyMedium" style={[styles.roleDescription, { color: theme.colors.onSurfaceVariant }]}>
                  List and sell your products to customers
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={styles.continueButton}
            contentStyle={styles.buttonContent}
          >
            Create Account
          </Button>
          
          <Text variant="bodySmall" style={[styles.note, { color: theme.colors.onSurfaceVariant }]}>
            You can change your role later in settings
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
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
  },
  options: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  roleCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  roleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  roleInfo: {
    flex: 1,
    marginLeft: spacing.md,
    alignItems: 'center',
  },
  roleTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  roleDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingBottom: spacing.lg,
  },
  continueButton: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  note: {
    textAlign: 'center',
  },
});

