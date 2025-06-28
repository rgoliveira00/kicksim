#!/bin/bash

# Create placeholder screens with basic structure
create_screen() {
    local file="$1"
    local title="$2"
    
    cat > "$file" << SCREEN_EOF
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ${title}Screen: React.FC = () => {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text variant="headlineMedium">${title}</Text>
        <Text variant="bodyLarge">This screen will be implemented soon.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
});
SCREEN_EOF
}

# Onboarding screens
create_screen "onboarding/FeaturesScreen.tsx" "Features"
create_screen "onboarding/PermissionsScreen.tsx" "Permissions"
create_screen "onboarding/NotificationsScreen.tsx" "Notifications"

# Seller screens
create_screen "seller/SellerDashboardScreen.tsx" "SellerDashboard"
create_screen "seller/ManageProductsScreen.tsx" "ManageProducts"
create_screen "seller/SellerOrdersScreen.tsx" "SellerOrders"
create_screen "seller/AddProductScreen.tsx" "AddProduct"
create_screen "seller/EditProductScreen.tsx" "EditProduct"

# Product screens
create_screen "product/ProductDetailScreen.tsx" "ProductDetail"

# Checkout screens
create_screen "checkout/CheckoutScreen.tsx" "Checkout"
create_screen "checkout/PaymentScreen.tsx" "Payment"

# Order screens
create_screen "order/OrderDetailScreen.tsx" "OrderDetail"

# Message screens
create_screen "message/MessageScreen.tsx" "Message"
create_screen "message/MessageListScreen.tsx" "MessageList"

# Review screens
create_screen "review/ReviewScreen.tsx" "Review"

# Profile screens
create_screen "profile/EditProfileScreen.tsx" "EditProfile"
create_screen "profile/SettingsScreen.tsx" "Settings"

echo "Created placeholder screens"
