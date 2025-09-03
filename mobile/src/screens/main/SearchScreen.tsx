import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Searchbar,
  Button,
  Chip,
  FAB,
  useTheme,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  searchProducts,
  clearSearch,
  setSearchFilters,
  selectSearchResults,
  selectSearchLoading,
  selectSearchError,
  selectSearchFilters,
  selectSearchQuery,
} from '@/store/slices/searchSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { ProductCard } from '@/components/ProductCard';
import { SearchFilters } from '@/components/SearchFilters';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ProductListItem, ProductFilters, ProductSortOption } from '@/types/product';
import { spacing, borderRadius } from '@/constants/theme';

type SearchScreenNavigationProp = StackNavigationProp<any, 'Search'>;

interface Props {
  navigation: SearchScreenNavigationProp;
}

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 2;

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  // Redux state
  const searchResults = useAppSelector(selectSearchResults);
  const isLoading = useAppSelector(selectSearchLoading);
  const error = useAppSelector(selectSearchError);
  const filters = useAppSelector(selectSearchFilters);
  const searchQuery = useAppSelector(selectSearchQuery);

  // Local state
  const [localQuery, setLocalQuery] = useState(searchQuery || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  // Bottom sheet refs
  const filtersBottomSheetRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['25%', '90%'], []);

  // Mock data for filters (in real app, this would come from API)
  const mockCategories = [
    { id: '1', name: 'Electronics', slug: 'electronics' },
    { id: '2', name: 'Clothing', slug: 'clothing' },
    { id: '3', name: 'Home & Garden', slug: 'home-garden' },
    { id: '4', name: 'Sports', slug: 'sports' },
    { id: '5', name: 'Books', slug: 'books' },
  ];

  const mockBrands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'Canon'];
  const mockPriceRange = { min: 0, max: 10000 };

  // Focus effect to refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (hasSearched && (searchQuery || Object.keys(filters).length > 0)) {
        handleSearch();
      }
    }, [])
  );

  // Handle search
  const handleSearch = useCallback(
    (query?: string, newFilters?: ProductFilters, pageNum: number = 1) => {
      const searchParams = {
        query: query !== undefined ? query : localQuery,
        filters: newFilters !== undefined ? newFilters : filters,
        page: pageNum,
        limit: 20,
      };

      dispatch(searchProducts(searchParams));
      setHasSearched(true);
      setPage(pageNum);
    },
    [localQuery, filters, dispatch]
  );

  // Handle search input submit
  const onSearchSubmit = () => {
    if (localQuery.trim()) {
      handleSearch(localQuery.trim(), filters, 1);
    }
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: ProductFilters) => {
    dispatch(setSearchFilters(newFilters));
    handleSearch(localQuery, newFilters, 1);
    filtersBottomSheetRef.current?.dismiss();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    const emptyFilters: ProductFilters = {};
    dispatch(setSearchFilters(emptyFilters));
    handleSearch(localQuery, emptyFilters, 1);
  };

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    handleSearch(localQuery, filters, 1);
    setTimeout(() => setRefreshing(false), 1000);
  }, [localQuery, filters, handleSearch]);

  // Handle load more
  const handleLoadMore = () => {
    if (!isLoading && searchResults.hasNextPage) {
      handleSearch(localQuery, filters, page + 1);
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

  // Get active filters count
  const getActiveFiltersCount = () => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof ProductFilters];
      return value !== undefined && value !== null && 
             (Array.isArray(value) ? value.length > 0 : true);
    }).length;
  };

  // Render search suggestions (when no search has been made)
  const renderSearchSuggestions = () => (
    <View style={styles.suggestionsContainer}>
      <Text variant="titleMedium" style={[styles.suggestionsTitle, { color: theme.colors.onBackground }]}>
        Popular Categories
      </Text>
      <View style={styles.categoriesGrid}>
        {mockCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
              const categoryFilters = { ...filters, category: category.id };
              handleFiltersChange(categoryFilters);
            }}
          >
            <Icon name="tag-outline" size={32} color={theme.colors.primary} />
            <Text variant="bodyMedium" style={styles.categoryName}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text variant="titleMedium" style={[styles.suggestionsTitle, { color: theme.colors.onBackground }]}>
        Quick Searches
      </Text>
      <View style={styles.quickSearches}>
        {['iPhone', 'Laptop', 'Sneakers', 'Books', 'Camera'].map((term) => (
          <Chip
            key={term}
            mode="outlined"
            onPress={() => {
              setLocalQuery(term);
              handleSearch(term, filters, 1);
            }}
            style={styles.quickSearchChip}
          >
            {term}
          </Chip>
        ))}
      </View>
    </View>
  );

  // Render search results
  const renderSearchResults = () => {
    if (isLoading && page === 1) {
      return <LoadingScreen message="Searching products..." />;
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text variant="titleMedium" style={[styles.errorTitle, { color: theme.colors.error }]}>
            Search Error
          </Text>
          <Text variant="bodyMedium" style={[styles.errorMessage, { color: theme.colors.onSurfaceVariant }]}>
            {error}
          </Text>
          <Button mode="contained" onPress={() => handleSearch()} style={styles.retryButton}>
            Try Again
          </Button>
        </View>
      );
    }

    if (searchResults.products.length === 0 && hasSearched) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="magnify" size={64} color={theme.colors.onSurfaceVariant} />
          <Text variant="titleLarge" style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
            No Results Found
          </Text>
          <Text variant="bodyMedium" style={[styles.emptyMessage, { color: theme.colors.onSurfaceVariant }]}>
            Try adjusting your search terms or filters
          </Text>
          <Button mode="outlined" onPress={handleClearFilters} style={styles.clearFiltersButton}>
            Clear Filters
          </Button>
        </View>
      );
    }

    return (
      <FlatList
        data={searchResults.products}
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
    <BottomSheetModalProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Search Header */}
        <View style={[styles.searchHeader, { backgroundColor: theme.colors.surface }]}>
          <Searchbar
            placeholder="Search products..."
            onChangeText={setLocalQuery}
            value={localQuery}
            onSubmitEditing={onSearchSubmit}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            icon="magnify"
            clearIcon="close"
          />
        </View>

        {/* Search Controls */}
        {hasSearched && (
          <View style={[styles.searchControls, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.searchInfo}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {searchResults.totalCount} results
                {localQuery && ` for "${localQuery}"`}
              </Text>
            </View>

            <View style={styles.controlButtons}>
              {/* View Mode Toggle */}
              <View style={styles.viewModeToggle}>
                <TouchableOpacity
                  onPress={() => setViewMode('grid')}
                  style={[
                    styles.viewModeButton,
                    viewMode === 'grid' && { backgroundColor: theme.colors.primaryContainer }
                  ]}
                >
                  <Icon
                    name="view-grid"
                    size={20}
                    color={viewMode === 'grid' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setViewMode('list')}
                  style={[
                    styles.viewModeButton,
                    viewMode === 'list' && { backgroundColor: theme.colors.primaryContainer }
                  ]}
                >
                  <Icon
                    name="view-list"
                    size={20}
                    color={viewMode === 'list' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>

              {/* Filters Button */}
              <Button
                mode="outlined"
                onPress={() => filtersBottomSheetRef.current?.present()}
                icon="filter-variant"
                compact
                style={styles.filtersButton}
              >
                Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
              </Button>
            </View>
          </View>
        )}

        {/* Active Filters */}
        {getActiveFiltersCount() > 0 && (
          <View style={styles.activeFilters}>
            <FlatList
              horizontal
              data={Object.entries(filters).filter(([_, value]) => 
                value !== undefined && value !== null && 
                (Array.isArray(value) ? value.length > 0 : true)
              )}
              renderItem={({ item: [key, value] }) => (
                <Chip
                  mode="flat"
                  onClose={() => {
                    const newFilters = { ...filters };
                    delete newFilters[key as keyof ProductFilters];
                    handleFiltersChange(newFilters);
                  }}
                  style={styles.activeFilterChip}
                >
                  {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                </Chip>
              )}
              keyExtractor={([key]) => key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeFiltersContent}
            />
          </View>
        )}

        <Divider />

        {/* Content */}
        <View style={styles.content}>
          {!hasSearched ? renderSearchSuggestions() : renderSearchResults()}
        </View>

        {/* Filters Bottom Sheet */}
        <BottomSheetModal
          ref={filtersBottomSheetRef}
          index={1}
          snapPoints={snapPoints}
          backgroundStyle={{ backgroundColor: theme.colors.background }}
        >
          <BottomSheetView style={styles.bottomSheetContent}>
            <SearchFilters
              filters={filters}
              categories={mockCategories}
              brands={mockBrands}
              priceRange={mockPriceRange}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </BottomSheetView>
        </BottomSheetModal>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    elevation: 2,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: 'transparent',
  },
  searchInput: {
    fontSize: 16,
  },
  searchControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    elevation: 1,
  },
  searchInfo: {
    flex: 1,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  viewModeToggle: {
    flexDirection: 'row',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  viewModeButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  filtersButton: {
    borderRadius: borderRadius.sm,
  },
  activeFilters: {
    paddingVertical: spacing.sm,
  },
  activeFiltersContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  activeFilterChip: {
    marginRight: spacing.xs,
  },
  content: {
    flex: 1,
  },
  suggestionsContainer: {
    padding: spacing.lg,
  },
  suggestionsTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  categoryCard: {
    width: (width - spacing.lg * 2 - spacing.md * 2) / 3,
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  categoryName: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  quickSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  quickSearchChip: {
    marginBottom: spacing.xs,
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
    marginBottom: spacing.lg,
  },
  clearFiltersButton: {
    borderRadius: borderRadius.md,
  },
  bottomSheetContent: {
    flex: 1,
  },
});
