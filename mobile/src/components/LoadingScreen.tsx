import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  showLogo = true 
}) => {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {showLogo && (
          <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.logoText, { color: theme.colors.onPrimary }]}>
              M
            </Text>
          </View>
        )}
        
        <ActivityIndicator 
          size="large" 
          color={theme.colors.primary}
          style={styles.spinner}
        />
        
        <Text 
          variant="bodyLarge" 
          style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
        >
          {message}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    marginHorizontal: 32,
  },
});

