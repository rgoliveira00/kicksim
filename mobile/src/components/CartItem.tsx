import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Button, useTheme, Checkbox } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { CartItem as CartItemType } from '@/store/slices/cartSlice';
import { spacing, borderRadius } from '@/constants/theme';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onToggleSelect?: (productId: string) => void;
  onProductPress?: (productId: string) => void;
  isSelected?: boolean;
  showSelection?: boolean;
}

export const CartItemComponent: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  onToggleSelect,
  onProductPress,
  isSelected = false,
  showSelection = false,
}) => {
  const theme = useTheme();

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, item.quantity + change);
    onUpdateQuantity(item.productId, newQuantity);
  };

  const totalPrice = item.price * item.quantity;

  return (
    <Card style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.content}>
        {/* Selection Checkbox */}
        {showSelection && onToggleSelect && (
          <View style={styles.selectionContainer}>
            <Checkbox
              status={isSelected ? 'checked' : 'unchecked'}
              onPress={() => onToggleSelect(item.productId)}
            />
          </View>
        )}

        {/* Product Image */}
        <TouchableOpacity
          onPress={() => onProductPress?.(item.productId)}
          style={styles.imageContainer}
        >
          <FastImage
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>

        {/* Product Details */}
        <View style={styles.details}>
          <TouchableOpacity
            onPress={() => onProductPress?.(item.productId)}
            style={styles.productInfo}
          >
            <Text variant="titleMedium" numberOfLines={2} style={styles.title}>
              {item.title}
            </Text>
            
            {item.variant && (
              <Text variant="bodySmall" style={[styles.variant, { color: theme.colors.onSurfaceVariant }]}>
                {item.variant}
              </Text>
            )}

            <Text variant="bodySmall" style={[styles.seller, { color: theme.colors.onSurfaceVariant }]}>
              Sold by {item.sellerName}
            </Text>

            {/* Availability Status */}
            <View style={styles.availabilityContainer}>
              {item.inStock ? (
                <View style={styles.inStockIndicator}>
                  <Icon name="check-circle" size={12} color={theme.colors.secondary} />
                  <Text variant="bodySmall" style={[styles.stockText, { color: theme.colors.secondary }]}>
                    In Stock
                  </Text>
                </View>
              ) : (
                <View style={styles.outOfStockIndicator}>
                  <Icon name="alert-circle" size={12} color={theme.colors.error} />
                  <Text variant="bodySmall" style={[styles.stockText, { color: theme.colors.error }]}>
                    Out of Stock
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Price and Actions */}
          <View style={styles.priceAndActions}>
            <View style={styles.priceContainer}>
              <Text variant="titleMedium" style={[styles.price, { color: theme.colors.primary }]}>
                {formatPrice(item.price, item.currency)}
              </Text>
              {item.originalPrice && item.originalPrice > item.price && (
                <Text
                  variant="bodySmall"
                  style={[styles.originalPrice, { color: theme.colors.onSurfaceVariant }]}
                >
                  {formatPrice(item.originalPrice, item.currency)}
                </Text>
              )}
            </View>

            {/* Quantity Controls */}
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={() => handleQuantityChange(-1)}
                style={[
                  styles.quantityButton,
                  { backgroundColor: theme.colors.surfaceVariant },
                  item.quantity <= 1 && { opacity: 0.5 }
                ]}
                disabled={item.quantity <= 1}
              >
                <Icon name="minus" size={16} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>

              <Text variant="bodyMedium" style={styles.quantity}>
                {item.quantity}
              </Text>

              <TouchableOpacity
                onPress={() => handleQuantityChange(1)}
                style={[
                  styles.quantityButton,
                  { backgroundColor: theme.colors.surfaceVariant },
                  !item.inStock && { opacity: 0.5 }
                ]}
                disabled={!item.inStock}
              >
                <Icon name="plus" size={16} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {/* Total Price */}
            <Text variant="titleMedium" style={[styles.totalPrice, { color: theme.colors.primary }]}>
              {formatPrice(totalPrice, item.currency)}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode="text"
              onPress={() => onRemove(item.productId)}
              compact
              textColor={theme.colors.error}
              icon="delete-outline"
            >
              Remove
            </Button>

            <Button
              mode="text"
              onPress={() => {
                // Handle save for later
              }}
              compact
              icon="heart-outline"
            >
              Save for Later
            </Button>
          </View>
        </View>
      </View>

      {/* Shipping Info */}
      {item.freeShipping && (
        <View style={[styles.shippingInfo, { backgroundColor: theme.colors.secondaryContainer }]}>
          <Icon name="truck-delivery" size={16} color={theme.colors.secondary} />
          <Text variant="bodySmall" style={[styles.shippingText, { color: theme.colors.secondary }]}>
            Free shipping on this item
          </Text>
        </View>
      )}

      {/* Out of Stock Overlay */}
      {!item.inStock && (
        <View style={[styles.outOfStockOverlay, { backgroundColor: `${theme.colors.error}10` }]}>
          <Text variant="bodySmall" style={[styles.outOfStockText, { color: theme.colors.error }]}>
            This item is currently out of stock
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    elevation: 1,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  selectionContainer: {
    justifyContent: 'flex-start',
    paddingTop: spacing.xs,
    marginRight: spacing.sm,
  },
  imageContainer: {
    marginRight: spacing.md,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
  },
  details: {
    flex: 1,
  },
  productInfo: {
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  variant: {
    marginBottom: spacing.xs,
  },
  seller: {
    marginBottom: spacing.xs,
  },
  availabilityContainer: {
    marginBottom: spacing.xs,
  },
  inStockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outOfStockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    marginLeft: 4,
    fontSize: 12,
  },
  priceAndActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontWeight: '600',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    marginHorizontal: spacing.sm,
    minWidth: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  totalPrice: {
    fontWeight: '700',
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  shippingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  shippingText: {
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  outOfStockText: {
    fontWeight: '500',
    textAlign: 'center',
  },
});

