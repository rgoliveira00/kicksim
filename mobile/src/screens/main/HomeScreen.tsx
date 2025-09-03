import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  useTheme,
  Searchbar,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';

import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { selectUser, selectUserRole } from '@/store/slices/authSlice';
import { selectIsConnected } from '@/store/slices/appSlice';
import { MainStackParamList } from '@/navigation/MainNavigator';
import { spacing, borderRadius } from '@/constants/theme';

type HomeScreenNavigationProp = StackNavigationProp<MainStackParamList>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

// Mock data - replace with real data from API
const mockCategories = [
  { id: '1', name: 'Electronics', icon: 'laptop', color: '#3B82F6' },
  { id: '2', name: 'Fashion', icon: 'tshirt-crew', color: '#EC4899' },
  { id: '3', name: 'Home & Garden', icon: 'home', color: '#10B981' },
  { id: '4', name: 'Sports', icon: 'basketball', color: '#F59E0B' },
  { id: '5', name: 'Books', icon: 'book', color: '#8B5CF6' },
  { id: '6', name: 'Health', icon: 'heart', color: '#EF4444' },
];

const mockFeaturedProducts = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 99.99,
    image: 'https://via.placeholder.com/200x200',
    rating: 4.5,
    seller: 'TechStore',
  },
  {
    id: '2',
    name: 'Smart Watch',
    price: 199.99,
    image: 'https://via.placeholder.com/200x200',
    rating: 4.8,
    seller: 'GadgetHub',
  },
  {
    id: '3',
    name: 'Bluetooth Speaker',
    price: 49.99,
    image: 'https://via.placeholder.com/200x200',
    rating: 4.3,
    seller: 'AudioWorld',
  },
];

const { width } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (width - spacing.md * 3) / 2;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  const user = useAppSelector(selectUser);
  const userRole = useAppSelector(selectUserRole);
  const isConnected = useAppSelector(selectIsConnected);

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Refresh data from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('MainTabs', { 
        screen: 'Search',
        params: { query: searchQuery }
      });
    }
  };

  // Handle category selection
  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    navigation.navigate('MainTabs', { 
      screen: 'Search',
      params: { category: categoryId }
    });
  };

  // Handle product press
  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  // Render category item
  const renderCategoryItem = ({ item }: { item: typeof mockCategories[0] }) => (
    <Surface
      style={[
        styles.categoryCard,
        { backgroundColor: theme.colors.surface },
        selectedCategory === item.id && { backgroundColor: theme.colors.primaryContainer }
      ]}
      elevation={1}
    >
      <Button
        mode="text"
        onPress={() => handleCategoryPress(item.id)}
        style={styles.categoryButton}
        contentStyle={styles.categoryButtonContent}
      >
        <View style={styles.categoryContent}>
          <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
            <Icon name={item.icon} size={24} color="white" />
          </View>
          <Text variant="bodySmall" style={styles.categoryText}>
            {item.name}
          </Text>
        </View>
      </Button>
    </Surface>
  );

  // Render product item
  const renderProductItem = ({ item }: { item: typeof mockFeaturedProducts[0] }) => (
    <Card
      style={[styles.productCard, { width: PRODUCT_CARD_WIDTH }]}
      onPress={() => handleProductPress(item.id)}
    >
      <FastImage
        source={{ uri: item.image }}
        style={styles.productImage}
        resizeMode={FastImage.resizeMode.cover}
      />
      <Card.Content style={styles.productContent}>
        <Text variant="titleSmall" numberOfLines={2} style={styles.productName}>
          {item.name}
        </Text>
        <Text variant="bodySmall" style={[styles.productSeller, { color: theme.colors.onSurfaceVariant }]}>
          by {item.seller}
        </Text>
        <View style={styles.productFooter}>
          <Text variant="titleMedium" style={[styles.productPrice, { color: theme.colors.primary }]}>
            ${item.price}
          </Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color={theme.colors.rating} />
            <Text variant="bodySmall" style={styles.ratingText}>
              {item.rating}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text variant="headlineSmall" style={{ color: theme.colors.onBackground }}>
              Hello, {user?.firstName || 'User'}! 👋
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {userRole === 'seller' ? 'Manage your store' : 'What are you looking for today?'}
            </Text>
          </View>
          
          {!isConnected && (
            <Chip
              icon="wifi-off"
              mode="outlined"
              compact
              style={[styles.offlineChip, { borderColor: theme.colors.error }]}
              textStyle={{ color: theme.colors.error }}
            >
              Offline
            </Chip>
          )}
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search products, brands, categories..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
          inputStyle={styles.searchInput}
          icon="magnify"
          onIconPress={handleSearch}
        />

        {/* Quick Actions for Sellers */}
        {userRole === 'seller' && (
          <View style={styles.quickActions}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Quick Actions
            </Text>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('AddProduct')}
                style={styles.actionButton}
                icon="plus"
              >
                Add Product
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('MainTabs', { screen: 'ManageProducts' })}
                style={styles.actionButton}
                icon="package-variant"
              >
                Manage Products
              </Button>
            </View>
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Categories
          </Text>
          <FlatList
            data={mockCategories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Featured Products
            </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('MainTabs', { screen: 'Search' })}
              compact
            >
              See All
            </Button>
          </View>
          <FlatList
            data={mockFeaturedProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
          />
        </View>

        {/* Promotional Banner */}
        <Card style={[styles.promoCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <Card.Content style={styles.promoContent}>
            <View style={styles.promoText}>
              <Text variant="titleMedium" style={{ color: theme.colors.onPrimaryContainer }}>
                🎉 Special Offer!
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer }}>
                Get 20% off on your first order
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('MainTabs', { screen: 'Search' })}
              style={styles.promoButton}
            >
              Shop Now
            </Button>
          </Card.Content>
        </Card>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  offlineChip: {
    marginTop: spacing.xs,
  },
  searchBar: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
  },
  searchInput: {
    fontSize: 16,
  },
  quickActions: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  categoriesList: {
    paddingHorizontal: spacing.md,
  },
  categoryCard: {
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
  },
  categoryButton: {
    margin: 0,
  },
  categoryButtonContent: {
    padding: spacing.sm,
  },
  categoryContent: {
    alignItems: 'center',
    width: 80,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryText: {
    textAlign: 'center',
  },
  productsList: {
    paddingHorizontal: spacing.md,
  },
  productCard: {
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
  },
  productContent: {
    padding: spacing.sm,
  },
  productName: {
    marginBottom: spacing.xs,
    minHeight: 32,
  },
  productSeller: {
    marginBottom: spacing.sm,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: spacing.xs,
  },
  promoCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  promoText: {
    flex: 1,
  },
  promoButton: {
    marginLeft: spacing.md,
    borderRadius: borderRadius.md,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

