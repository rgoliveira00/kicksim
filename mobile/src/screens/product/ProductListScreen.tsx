import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Button,
  Chip,
  useTheme,
  ActivityIndicator,
  Appbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  fetchProducts,
  selectProducts,
  selectProductsLoading,
  selectProductsError,
} from '@/store/slices/productSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { ProductCard } from '@/components/ProductCard';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ProductListItem, ProductFilters, ProductSortOption } from '@/types/product';
import { spacing, borderRadius } from '@/constants/theme';

type ProductListScreenNavigationProp = StackNavigationProp<any, 'ProductList'>;
type ProductListScreenRouteProp = RouteProp<any, 'ProductList'>;

interface Props {
  navigation: ProductListScreenNavigationProp;
  route: ProductListScreenRouteProp;
}

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 2;

export const ProductListScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  // Route params
  const { 
    categoryId, 
    categoryName, 
    subcategoryId, 
    subcategoryName,
    initialFilters 
  } = route.params || {};

  // Redux state
  const products = useAppSelector(selectProducts);
  const isLoading = useAppSelector(selectProductsLoading);
  const error = useAppSelector(selectProductsError);

  // Local state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<ProductSortOption>(ProductSortOption.RELEVANCE);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters || {});

  // Load products on mount and when filters change
  useEffect(() => {
    loadProducts(1);
  }, [categoryId, subcategoryId, sortBy, filters]);

  // Load products function
  const loadProducts = useCallback(
    (pageNum: number = 1) => {
      const searchParams = {
        page: pageNum,
        limit: 20,
        filters: {
          ...filters,
          category: categoryId,
          subcategory: subcategoryId,
          sortBy,
        },
      };

      dispatch(fetchProducts(searchParams));
      setPage(pageNum);
    },
    [categoryId, subcategoryId, sortBy, filters, dispatch]
  );

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts(1);
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadProducts]);

  // Handle load more
  const handleLoadMore = () => {
    if (!isLoading && products.hasNextPage) {
      loadProducts(page + 1);
    }
  };

  // Handle add to cart
  const handleAddToCart = (productId: string) => {
    dispatch(addToCart({ productId, quantity: 1 }));
    // Show toast notification
  };

  // Handle product press
  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  // Handle sort change
  const handleSortChange = (newSortBy: ProductSortOption) => {
    setSortBy(newSortBy);
  };

  // Get screen title
  const getScreenTitle = () => {
    if (subcategoryName) return subcategoryName;
    if (categoryName) return categoryName;
    return 'Products';
  };

  // Render sort options
  const renderSortOptions = () => (
    <View style={styles.sortContainer}>
      <FlatList
        horizontal
        data={Object.values(ProductSortOption)}
        renderItem={({ item }) => (
          <Chip
            mode={sortBy === item ? 'flat' : 'outlined'}
            selected={sortBy === item}
            onPress={() => handleSortChange(item)}
            style={styles.sortChip}
          >
            {getSortLabel(item)}
          </Chip>
        )}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortList}
      />
    </View>
  );

  // Get sort label
  const getSortLabel = (sortOption: ProductSortOption) => {
    switch (sortOption) {
      case ProductSortOption.RELEVANCE:
        return 'Relevance';
      case ProductSortOption.PRICE_LOW_TO_HIGH:
        return 'Price ↑';
      case ProductSortOption.PRICE_HIGH_TO_LOW:
        return 'Price ↓';
      case ProductSortOption.NEWEST:
        return 'Newest';
      case ProductSortOption.RATING:
        return 'Rating';
      case ProductSortOption.POPULARITY:
        return 'Popular';
      default:
        return 'Relevance';
    }
  };

  // Render content
  const renderContent = () => {
    if (isLoading && page === 1) {
      return <LoadingScreen message="Loading products..." />;
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text variant="titleMedium" style={[styles.errorTitle, { color: theme.colors.error }]}>
            Error Loading Products
          </Text>
          <Text variant="bodyMedium" style={[styles.errorMessage, { color: theme.colors.onSurfaceVariant }]}>
            {error}
          </Text>
          <Button mode="contained" onPress={() => loadProducts(1)} style={styles.retryButton}>
            Try Again
          </Button>
        </View>
      );
    }

    if (products.products.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="package-variant" size={64} color={theme.colors.onSurfaceVariant} />
          <Text variant="titleLarge" style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
            No Products Found
          </Text>
          <Text variant="bodyMedium" style={[styles.emptyMessage, { color: theme.colors.onSurfaceVariant }]}>
            Try browsing other categories or check back later
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={products.products}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={handleProductPress}
            onAddToCart={handleAddToCart}
            variant={viewMode}
            showAddToCart={true}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? GRID_COLUMNS : 1}
        key={viewMode} // Force re-render when view mode changes
        contentContainerStyle={styles.productsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={renderSortOptions}
        ListFooterComponent={
          isLoading && page > 1 ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>
                Loading more...
              </Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={getScreenTitle()} />
        <Appbar.Action
          icon={viewMode === 'grid' ? 'view-list' : 'view-grid'}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        />
        <Appbar.Action
          icon="filter-variant"
          onPress={() => {
            // Navigate to filters screen or show bottom sheet
            // navigation.navigate('ProductFilters', { filters, onApply: setFilters });
          }}
        />
      </Appbar.Header>

      {/* Product Count */}
      <View style={[styles.productCount, { backgroundColor: theme.colors.surface }]}>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {products.totalCount} products found
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  productCount: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  content: {
    flex: 1,
  },
  sortContainer: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sortList: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  sortChip: {
    marginRight: spacing.xs,
  },
  productsList: {
    padding: spacing.md,
  },
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    borderRadius: borderRadius.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    textAlign: 'center',
  },
});

