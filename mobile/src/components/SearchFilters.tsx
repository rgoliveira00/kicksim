import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Button,
  Chip,
  TextInput,
  Card,
  Divider,
  RadioButton,
  Checkbox,
  useTheme,
} from 'react-native-paper';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { ProductFilters, ProductSortOption, ProductCondition, Category } from '@/types/product';
import { spacing, borderRadius } from '@/constants/theme';

interface SearchFiltersProps {
  filters: ProductFilters;
  categories: Category[];
  brands: string[];
  priceRange: { min: number; max: number };
  onFiltersChange: (filters: ProductFilters) => void;
  onClearFilters: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  categories,
  brands,
  priceRange,
  onFiltersChange,
  onClearFilters,
}) => {
  const theme = useTheme();
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters);
  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() || '');

  const updateFilters = (updates: Partial<ProductFilters>) => {
    const newFilters = { ...localFilters, ...updates };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    const finalFilters = {
      ...localFilters,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    };
    onFiltersChange(finalFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters: ProductFilters = {};
    setLocalFilters(emptyFilters);
    setMinPrice('');
    setMaxPrice('');
    onClearFilters();
  };

  const toggleCondition = (condition: ProductCondition) => {
    const currentConditions = localFilters.condition || [];
    const newConditions = currentConditions.includes(condition)
      ? currentConditions.filter(c => c !== condition)
      : [...currentConditions, condition];
    
    updateFilters({ condition: newConditions.length > 0 ? newConditions : undefined });
  };

  const toggleBrand = (brand: string) => {
    const currentBrands = localFilters.brand || [];
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter(b => b !== brand)
      : [...currentBrands, brand];
    
    updateFilters({ brand: newBrands.length > 0 ? newBrands : undefined });
  };

  const getSortLabel = (sortOption: ProductSortOption) => {
    switch (sortOption) {
      case ProductSortOption.RELEVANCE:
        return 'Relevance';
      case ProductSortOption.PRICE_LOW_TO_HIGH:
        return 'Price: Low to High';
      case ProductSortOption.PRICE_HIGH_TO_LOW:
        return 'Price: High to Low';
      case ProductSortOption.NEWEST:
        return 'Newest First';
      case ProductSortOption.OLDEST:
        return 'Oldest First';
      case ProductSortOption.RATING:
        return 'Highest Rated';
      case ProductSortOption.POPULARITY:
        return 'Most Popular';
      case ProductSortOption.DISTANCE:
        return 'Nearest First';
      default:
        return 'Relevance';
    }
  };

  const getConditionLabel = (condition: ProductCondition) => {
    switch (condition) {
      case ProductCondition.NEW:
        return 'New';
      case ProductCondition.LIKE_NEW:
        return 'Like New';
      case ProductCondition.GOOD:
        return 'Good';
      case ProductCondition.FAIR:
        return 'Fair';
      case ProductCondition.POOR:
        return 'Poor';
      default:
        return condition;
    }
  };

  const hasActiveFilters = () => {
    return Object.keys(localFilters).some(key => {
      const value = localFilters[key as keyof ProductFilters];
      return value !== undefined && value !== null && 
             (Array.isArray(value) ? value.length > 0 : true);
    }) || minPrice !== '' || maxPrice !== '';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={{ color: theme.colors.onBackground }}>
          Filters
        </Text>
        {hasActiveFilters() && (
          <Button mode="text" onPress={clearAllFilters} compact>
            Clear All
          </Button>
        )}
      </View>

      {/* Sort Options */}
      <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Sort By
          </Text>
          <RadioButton.Group
            onValueChange={(value) => updateFilters({ sortBy: value as ProductSortOption })}
            value={localFilters.sortBy || ProductSortOption.RELEVANCE}
          >
            {Object.values(ProductSortOption).map((option) => (
              <RadioButton.Item
                key={option}
                label={getSortLabel(option)}
                value={option}
                style={styles.radioItem}
              />
            ))}
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Categories */}
      {categories.length > 0 && (
        <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Categories
            </Text>
            <View style={styles.chipContainer}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  mode={localFilters.category === category.id ? 'flat' : 'outlined'}
                  selected={localFilters.category === category.id}
                  onPress={() => updateFilters({ 
                    category: localFilters.category === category.id ? undefined : category.id 
                  })}
                  style={styles.chip}
                >
                  {category.name}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Price Range */}
      <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Price Range
          </Text>
          <View style={styles.priceInputs}>
            <TextInput
              label="Min Price"
              value={minPrice}
              onChangeText={setMinPrice}
              keyboardType="numeric"
              mode="outlined"
              style={styles.priceInput}
              left={<TextInput.Icon icon="currency-usd" />}
            />
            <Text variant="bodyLarge" style={styles.priceSeparator}>
              to
            </Text>
            <TextInput
              label="Max Price"
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="numeric"
              mode="outlined"
              style={styles.priceInput}
              left={<TextInput.Icon icon="currency-usd" />}
            />
          </View>
          {priceRange.min !== undefined && priceRange.max !== undefined && (
            <Text variant="bodySmall" style={[styles.priceHint, { color: theme.colors.onSurfaceVariant }]}>
              Available range: ${priceRange.min} - ${priceRange.max}
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Condition */}
      <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Condition
          </Text>
          <View style={styles.checkboxContainer}>
            {Object.values(ProductCondition).map((condition) => (
              <Checkbox.Item
                key={condition}
                label={getConditionLabel(condition)}
                status={(localFilters.condition || []).includes(condition) ? 'checked' : 'unchecked'}
                onPress={() => toggleCondition(condition)}
                style={styles.checkboxItem}
              />
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Brands */}
      {brands.length > 0 && (
        <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Brands
            </Text>
            <View style={styles.chipContainer}>
              {brands.slice(0, 10).map((brand) => (
                <Chip
                  key={brand}
                  mode={(localFilters.brand || []).includes(brand) ? 'flat' : 'outlined'}
                  selected={(localFilters.brand || []).includes(brand)}
                  onPress={() => toggleBrand(brand)}
                  style={styles.chip}
                >
                  {brand}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Additional Filters */}
      <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Additional Filters
          </Text>
          
          <Checkbox.Item
            label="Free Shipping"
            status={localFilters.freeShipping ? 'checked' : 'unchecked'}
            onPress={() => updateFilters({ freeShipping: !localFilters.freeShipping })}
            style={styles.checkboxItem}
          />
          
          <Checkbox.Item
            label="In Stock Only"
            status={localFilters.inStock ? 'checked' : 'unchecked'}
            onPress={() => updateFilters({ inStock: !localFilters.inStock })}
            style={styles.checkboxItem}
          />

          <View style={styles.ratingFilter}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              Minimum Rating
            </Text>
            <View style={styles.ratingOptions}>
              {[4, 3, 2, 1].map((rating) => (
                <Chip
                  key={rating}
                  mode={localFilters.rating === rating ? 'flat' : 'outlined'}
                  selected={localFilters.rating === rating}
                  onPress={() => updateFilters({ 
                    rating: localFilters.rating === rating ? undefined : rating 
                  })}
                  style={styles.ratingChip}
                  icon={() => <Icon name="star" size={14} color={theme.colors.tertiary} />}
                >
                  {rating}+
                </Chip>
              ))}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Apply Filters Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={applyFilters}
          style={styles.applyButton}
          contentStyle={styles.applyButtonContent}
        >
          Apply Filters
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    marginBottom: spacing.xs,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceInput: {
    flex: 1,
  },
  priceSeparator: {
    paddingHorizontal: spacing.xs,
  },
  priceHint: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  checkboxContainer: {
    marginTop: spacing.xs,
  },
  checkboxItem: {
    paddingVertical: 0,
  },
  radioItem: {
    paddingVertical: 0,
  },
  ratingFilter: {
    marginTop: spacing.sm,
  },
  ratingOptions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  ratingChip: {
    minWidth: 60,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  applyButton: {
    borderRadius: borderRadius.md,
  },
  applyButtonContent: {
    paddingVertical: spacing.sm,
  },
});

