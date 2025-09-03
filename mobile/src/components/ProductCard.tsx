import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Card, Text, Chip, useTheme } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { ProductListItem, ProductCondition } from '@/types/product';
import { spacing, borderRadius } from '@/constants/theme';

interface ProductCardProps {
  product: ProductListItem;
  onPress: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
  variant?: 'grid' | 'list';
  showAddToCart?: boolean;
}

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - spacing.lg * 3) / 2;

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
  variant = 'grid',
  showAddToCart = true,
}) => {
  const theme = useTheme();

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getConditionColor = (condition: ProductCondition) => {
    switch (condition) {
      case ProductCondition.NEW:
        return theme.colors.primary;
      case ProductCondition.LIKE_NEW:
        return theme.colors.secondary;
      case ProductCondition.GOOD:
        return theme.colors.tertiary;
      default:
        return theme.colors.outline;
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
        return 'Used';
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="star" size={12} color={theme.colors.tertiary} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="star-half-full" size={12} color={theme.colors.tertiary} />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="star-outline" size={12} color={theme.colors.outline} />
      );
    }

    return stars;
  };

  if (variant === 'list') {
    return (
      <Card style={[styles.listCard, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => onPress(product.id)} style={styles.listContainer}>
          <FastImage
            source={{ uri: product.image }}
            style={styles.listImage}
            resizeMode={FastImage.resizeMode.cover}
          />
          
          <View style={styles.listContent}>
            <View style={styles.listHeader}>
              <Text variant="titleMedium" numberOfLines={2} style={styles.listTitle}>
                {product.title}
              </Text>
              
              {onToggleWishlist && (
                <TouchableOpacity
                  onPress={() => onToggleWishlist(product.id)}
                  style={styles.wishlistButton}
                >
                  <Icon
                    name={isInWishlist ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isInWishlist ? theme.colors.error : theme.colors.outline}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.listMeta}>
              <View style={styles.ratingContainer}>
                <View style={styles.stars}>
                  {renderStars(product.rating)}
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  ({product.reviewCount})
                </Text>
              </View>

              <View style={styles.sellerInfo}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  by {product.seller.name}
                </Text>
                {product.seller.verified && (
                  <Icon name="check-decagram" size={12} color={theme.colors.primary} />
                )}
              </View>
            </View>

            <View style={styles.listFooter}>
              <View style={styles.priceContainer}>
                <Text variant="titleLarge" style={[styles.price, { color: theme.colors.primary }]}>
                  {formatPrice(product.price, product.currency)}
                </Text>
                {product.originalPrice && product.originalPrice > product.price && (
                  <Text
                    variant="bodyMedium"
                    style={[styles.originalPrice, { color: theme.colors.onSurfaceVariant }]}
                  >
                    {formatPrice(product.originalPrice, product.currency)}
                  </Text>
                )}
              </View>

              {showAddToCart && onAddToCart && (
                <TouchableOpacity
                  onPress={() => onAddToCart(product.id)}
                  style={[styles.addToCartButton, { backgroundColor: theme.colors.primary }]}
                >
                  <Icon name="cart-plus" size={16} color={theme.colors.onPrimary} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.badges}>
              {product.featured && (
                <Chip
                  mode="flat"
                  compact
                  style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}
                  textStyle={{ fontSize: 10 }}
                >
                  Featured
                </Chip>
              )}
              
              {product.freeShipping && (
                <Chip
                  mode="flat"
                  compact
                  style={[styles.badge, { backgroundColor: theme.colors.secondaryContainer }]}
                  textStyle={{ fontSize: 10 }}
                >
                  Free Shipping
                </Chip>
              )}
              
              <Chip
                mode="flat"
                compact
                style={[
                  styles.badge,
                  { backgroundColor: `${getConditionColor(product.condition)}20` }
                ]}
                textStyle={{ fontSize: 10, color: getConditionColor(product.condition) }}
              >
                {getConditionLabel(product.condition)}
              </Chip>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    );
  }

  // Grid variant (default)
  return (
    <Card style={[styles.gridCard, { backgroundColor: theme.colors.surface, width: GRID_ITEM_WIDTH }]}>
      <TouchableOpacity onPress={() => onPress(product.id)}>
        <View style={styles.imageContainer}>
          <FastImage
            source={{ uri: product.image }}
            style={styles.gridImage}
            resizeMode={FastImage.resizeMode.cover}
          />
          
          {product.featured && (
            <View style={[styles.featuredBadge, { backgroundColor: theme.colors.primary }]}>
              <Text variant="labelSmall" style={{ color: theme.colors.onPrimary }}>
                Featured
              </Text>
            </View>
          )}

          {onToggleWishlist && (
            <TouchableOpacity
              onPress={() => onToggleWishlist(product.id)}
              style={[styles.wishlistButtonGrid, { backgroundColor: theme.colors.surface }]}
            >
              <Icon
                name={isInWishlist ? 'heart' : 'heart-outline'}
                size={16}
                color={isInWishlist ? theme.colors.error : theme.colors.outline}
              />
            </TouchableOpacity>
          )}
        </View>

        <Card.Content style={styles.gridContent}>
          <Text variant="bodyMedium" numberOfLines={2} style={styles.gridTitle}>
            {product.title}
          </Text>

          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {renderStars(product.rating)}
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              ({product.reviewCount})
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text variant="titleMedium" style={[styles.price, { color: theme.colors.primary }]}>
              {formatPrice(product.price, product.currency)}
            </Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text
                variant="bodySmall"
                style={[styles.originalPrice, { color: theme.colors.onSurfaceVariant }]}
              >
                {formatPrice(product.originalPrice, product.currency)}
              </Text>
            )}
          </View>

          <View style={styles.sellerInfo}>
            <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
              {product.seller.name}
            </Text>
            {product.seller.verified && (
              <Icon name="check-decagram" size={10} color={theme.colors.primary} />
            )}
          </View>

          <View style={styles.gridBadges}>
            {product.freeShipping && (
              <Chip
                mode="flat"
                compact
                style={[styles.smallBadge, { backgroundColor: theme.colors.secondaryContainer }]}
                textStyle={{ fontSize: 9 }}
              >
                Free Ship
              </Chip>
            )}
            
            <Chip
              mode="flat"
              compact
              style={[
                styles.smallBadge,
                { backgroundColor: `${getConditionColor(product.condition)}20` }
              ]}
              textStyle={{ fontSize: 9, color: getConditionColor(product.condition) }}
            >
              {getConditionLabel(product.condition)}
            </Chip>
          </View>

          {showAddToCart && onAddToCart && (
            <TouchableOpacity
              onPress={() => onAddToCart(product.id)}
              style={[styles.gridAddToCartButton, { backgroundColor: theme.colors.primary }]}
            >
              <Icon name="cart-plus" size={14} color={theme.colors.onPrimary} />
              <Text variant="labelSmall" style={{ color: theme.colors.onPrimary, marginLeft: 4 }}>
                Add to Cart
              </Text>
            </TouchableOpacity>
          )}
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  // Grid styles
  gridCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  wishlistButtonGrid: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  gridContent: {
    padding: spacing.sm,
  },
  gridTitle: {
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  gridBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: spacing.xs,
  },
  smallBadge: {
    height: 20,
  },
  gridAddToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },

  // List styles
  listCard: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    elevation: 1,
  },
  listContainer: {
    flexDirection: 'row',
    padding: spacing.sm,
  },
  listImage: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  listContent: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  listTitle: {
    flex: 1,
    marginRight: spacing.sm,
    lineHeight: 20,
  },
  listMeta: {
    marginBottom: spacing.sm,
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  addToCartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  badge: {
    height: 22,
  },

  // Common styles
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stars: {
    flexDirection: 'row',
    marginRight: spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  price: {
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  wishlistButton: {
    padding: 4,
  },
});

