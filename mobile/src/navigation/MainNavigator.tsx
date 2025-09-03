import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';
import { useAppSelector } from '@/hooks/redux';
import { selectUserRole } from '@/store/slices/authSlice';

// Import tab screens
import { HomeScreen } from '@/screens/main/HomeScreen';
import { SearchScreen } from '@/screens/main/SearchScreen';
import { CartScreen } from '@/screens/main/CartScreen';
import { OrdersScreen } from '@/screens/main/OrdersScreen';
import { ProfileScreen } from '@/screens/main/ProfileScreen';

// Import seller screens
import { SellerDashboardScreen } from '@/screens/seller/SellerDashboardScreen';
import { ManageProductsScreen } from '@/screens/seller/ManageProductsScreen';
import { SellerOrdersScreen } from '@/screens/seller/SellerOrdersScreen';

// Import modal/detail screens
import { ProductDetailScreen } from '@/screens/product/ProductDetailScreen';
import { CheckoutScreen } from '@/screens/checkout/CheckoutScreen';
import { PaymentScreen } from '@/screens/checkout/PaymentScreen';
import { OrderDetailScreen } from '@/screens/order/OrderDetailScreen';
import { MessageScreen } from '@/screens/message/MessageScreen';
import { MessageListScreen } from '@/screens/message/MessageListScreen';
import { ReviewScreen } from '@/screens/review/ReviewScreen';
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen';
import { SettingsScreen } from '@/screens/profile/SettingsScreen';
import { AddProductScreen } from '@/screens/seller/AddProductScreen';
import { EditProductScreen } from '@/screens/seller/EditProductScreen';

// Navigation types
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
  // Seller tabs
  SellerDashboard: undefined;
  ManageProducts: undefined;
  SellerOrders: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  ProductDetail: { productId: string };
  Checkout: undefined;
  Payment: { orderId: string };
  OrderDetail: { orderId: string };
  MessageList: undefined;
  Message: { conversationId: string; recipientName: string };
  Review: { productId: string; orderId?: string };
  EditProfile: undefined;
  Settings: undefined;
  AddProduct: undefined;
  EditProduct: { productId: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

// Tab navigator component
const MainTabs: React.FC = () => {
  const theme = useTheme();
  const userRole = useAppSelector(selectUserRole);
  const isSeller = userRole === 'seller' || userRole === 'admin';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Search':
              iconName = focused ? 'magnify' : 'magnify';
              break;
            case 'Cart':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Orders':
              iconName = focused ? 'package-variant' : 'package-variant-closed';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            case 'SellerDashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'ManageProducts':
              iconName = focused ? 'package-variant' : 'package-variant-closed';
              break;
            case 'SellerOrders':
              iconName = focused ? 'clipboard-list' : 'clipboard-list-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      {/* Buyer/Common tabs */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarLabel: 'Search' }}
      />
      
      {!isSeller && (
        <Tab.Screen
          name="Cart"
          component={CartScreen}
          options={{ 
            tabBarLabel: 'Cart',
            tabBarBadge: undefined, // TODO: Add cart item count
          }}
        />
      )}
      
      <Tab.Screen
        name="Orders"
        component={isSeller ? SellerOrdersScreen : OrdersScreen}
        options={{ tabBarLabel: 'Orders' }}
      />

      {/* Seller-specific tabs */}
      {isSeller && (
        <>
          <Tab.Screen
            name="SellerDashboard"
            component={SellerDashboardScreen}
            options={{ tabBarLabel: 'Dashboard' }}
          />
          
          <Tab.Screen
            name="ManageProducts"
            component={ManageProductsScreen}
            options={{ tabBarLabel: 'Products' }}
          />
        </>
      )}
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Main stack navigator
export const MainNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
        gestureEnabled: true,
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
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product Details' }}
      />
      
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ 
          title: 'Checkout',
          gestureEnabled: false, // Prevent accidental back during checkout
        }}
      />
      
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ 
          title: 'Payment',
          gestureEnabled: false,
        }}
      />
      
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Order Details' }}
      />
      
      <Stack.Screen
        name="MessageList"
        component={MessageListScreen}
        options={{ title: 'Messages' }}
      />
      
      <Stack.Screen
        name="Message"
        component={MessageScreen}
        options={({ route }) => ({ 
          title: route.params.recipientName,
        })}
      />
      
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ title: 'Write Review' }}
      />
      
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      
      <Stack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{ title: 'Add Product' }}
      />
      
      <Stack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{ title: 'Edit Product' }}
      />
    </Stack.Navigator>
  );
};

