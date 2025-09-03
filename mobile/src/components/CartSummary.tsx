import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Divider, useTheme, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { spacing, borderRadius } from '@/constants/theme';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  discount?: number;
  total: number;
  currency: string;
  itemCount: number;
  freeShippingThreshold?: number;
  promoCode?: string;
  onRemovePromo?: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  shipping,
  tax,
  discount = 0,
  total,
  currency,
  itemCount,
  freeShippingThreshold,
  promoCode,
  onRemovePromo,
}) => {
  const theme = useTheme();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const freeShippingProgress = freeShippingThreshold 
    ? Math.min(subtotal / freeShippingThreshold, 1) 
    : 1;
  
  const remainingForFreeShipping = freeShippingThreshold 
    ? Math.max(freeShippingThreshold - subtotal, 0) 
    : 0;

  return (
    <Card style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.title}>
            Order Summary
          </Text>
          <Text variant="bodyMedium" style={[styles.itemCount, { color: theme.colors.onSurfaceVariant }]}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Free Shipping Progress */}
        {freeShippingThreshold && remainingForFreeShipping > 0 && (
          <View style={styles.freeShippingContainer}>
            <View style={styles.freeShippingHeader}>
              <Icon name="truck-delivery" size={16} color={theme.colors.secondary} />
              <Text variant="bodySmall" style={[styles.freeShippingText, { color: theme.colors.secondary }]}>
                Add {formatPrice(remainingForFreeShipping)} more for free shipping
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: theme.colors.secondary,
                    width: `${freeShippingProgress * 100}%`
                  }
                ]} 
              />
            </View>
          </View>
        )}

        {/* Price Breakdown */}
        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text variant="bodyMedium">Subtotal</Text>
            <Text variant="bodyMedium" style={styles.priceValue}>
              {formatPrice(subtotal)}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text variant="bodyMedium">Shipping</Text>
            <Text variant="bodyMedium" style={styles.priceValue}>
              {shipping === 0 ? 'Free' : formatPrice(shipping)}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text variant="bodyMedium">Tax</Text>
            <Text variant="bodyMedium" style={styles.priceValue}>
              {formatPrice(tax)}
            </Text>
          </View>

          {discount > 0 && (
            <View style={styles.priceRow}>
              <View style={styles.discountRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
                  Discount
                </Text>
                {promoCode && (
                  <Chip
                    mode="flat"
                    compact
                    onClose={onRemovePromo}
                    style={[styles.promoChip, { backgroundColor: theme.colors.secondaryContainer }]}
                    textStyle={{ fontSize: 10 }}
                  >
                    {promoCode}
                  </Chip>
                )}
              </View>
              <Text variant="bodyMedium" style={[styles.priceValue, { color: theme.colors.secondary }]}>
                -{formatPrice(discount)}
              </Text>
            </View>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Total */}
        <View style={styles.totalRow}>
          <Text variant="titleMedium" style={styles.totalLabel}>
            Total
          </Text>
          <Text variant="titleLarge" style={[styles.totalValue, { color: theme.colors.primary }]}>
            {formatPrice(total)}
          </Text>
        </View>

        {/* Savings Display */}
        {discount > 0 && (
          <View style={styles.savingsContainer}>
            <Icon name="tag" size={16} color={theme.colors.secondary} />
            <Text variant="bodySmall" style={[styles.savingsText, { color: theme.colors.secondary }]}>
              You're saving {formatPrice(discount)} on this order!
            </Text>
          </View>
        )}

        {/* Free Shipping Achievement */}
        {freeShippingThreshold && remainingForFreeShipping === 0 && shipping === 0 && (
          <View style={styles.achievementContainer}>
            <Icon name="check-circle" size={16} color={theme.colors.secondary} />
            <Text variant="bodySmall" style={[styles.achievementText, { color: theme.colors.secondary }]}>
              Congratulations! You've qualified for free shipping
            </Text>
          </View>
        )}

        {/* Estimated Delivery */}
        <View style={styles.deliveryContainer}>
          <Icon name="calendar-clock" size={16} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodySmall" style={[styles.deliveryText, { color: theme.colors.onSurfaceVariant }]}>
            Estimated delivery: 3-5 business days
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    elevation: 2,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontWeight: '600',
  },
  itemCount: {},
  divider: {
    marginVertical: spacing.md,
  },
  freeShippingContainer: {
    marginBottom: spacing.md,
  },
  freeShippingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  freeShippingText: {
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  priceBreakdown: {
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  priceValue: {
    fontWeight: '500',
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  promoChip: {
    height: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  totalLabel: {
    fontWeight: '600',
  },
  totalValue: {
    fontWeight: '700',
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: borderRadius.sm,
  },
  savingsText: {
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  achievementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: borderRadius.sm,
  },
  achievementText: {
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  deliveryText: {
    marginLeft: spacing.xs,
  },
});

