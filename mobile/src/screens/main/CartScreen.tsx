import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  Appbar,
  useTheme,
  TextInput,
  Chip,
  FAB,
  Portal,
  Modal,
  Checkbox,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  selectCartSubtotal,
  CartItem,
} from '@/store/slices/cartSlice';
import { CartItemComponent } from '@/components/CartItem';
import { CartSummary } from '@/components/CartSummary';
import { LoadingScreen } from '@/components/LoadingScreen';
import { spacing, borderRadius } from '@/constants/theme';

type CartScreenNavigationProp = StackNavigationProp<any, 'Cart'>;

interface Props {
  navigation: CartScreenNavigationProp;
}

export const CartScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  // Redux state
  const cartItems = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotal);
  const cartSubtotal = useAppSelector(selectCartSubtotal);
  const itemCount = useAppSelector(selectCartItemCount);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);

  // Calculate pricing
  const shipping = cartSubtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const tax = cartSubtotal * 0.08; // 8% tax
  const discount = appliedPromo ? cartSubtotal * 0.1 : 0; // 10% discount with promo
  const finalTotal = cartSubtotal + shipping + tax - discount;

  // Available items (in stock)
  const availableItems = cartItems.filter(item => item.inStock);
  const unavailableItems = cartItems.filter(item => !item.inStock);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Handle quantity update
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    dispatch(updateCartItemQuantity({ productId, quantity }));
  };

  // Handle remove item
  const handleRemoveItem = (productId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => dispatch(removeFromCart(productId))
        },
      ]
    );
  };

  // Handle clear cart
  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => dispatch(clearCart())
        },
      ]
    );
  };

  // Handle product press
  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  // Handle checkout
  const handleCheckout = () => {
    if (availableItems.length === 0) {
      Alert.alert('No Available Items', 'Please remove out-of-stock items before proceeding to checkout.');
      return;
    }
    navigation.navigate('Checkout');
  };

  // Handle continue shopping
  const handleContinueShopping = () => {
    navigation.navigate('Home');
  };

  // Handle promo code
  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'save10') {
      setAppliedPromo(promoCode);
      setPromoCode('');
      setShowPromoModal(false);
      Alert.alert('Success', 'Promo code applied! You saved 10%');
    } else {
      Alert.alert('Invalid Code', 'The promo code you entered is not valid.');
    }
  };

  // Handle remove promo
  const handleRemovePromo = () => {
    setAppliedPromo(null);
  };

  // Handle select item
  const handleToggleSelect = (productId: string) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === availableItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(availableItems.map(item => item.productId));
    }
  };

  // Handle remove selected
  const handleRemoveSelected = () => {
    if (selectedItems.length === 0) return;
    
    Alert.alert(
      'Remove Selected Items',
      `Are you sure you want to remove ${selectedItems.length} selected items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            selectedItems.forEach(productId => dispatch(removeFromCart(productId)));
            setSelectedItems([]);
            setSelectMode(false);
          }
        },
      ]
    );
  };

  // Render empty cart
  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Icon name="cart-outline" size={80} color={theme.colors.onSurfaceVariant} />
      <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
        Your cart is empty
      </Text>
      <Text variant="bodyLarge" style={[styles.emptyMessage, { color: theme.colors.onSurfaceVariant }]}>
        Add some products to get started
      </Text>
      <Button
        mode="contained"
        onPress={handleContinueShopping}
        style={styles.continueShoppingButton}
        contentStyle={styles.buttonContent}
      >
        Continue Shopping
      </Button>
    </View>
  );

  // Render cart header
  const renderCartHeader = () => (
    <View style={styles.cartHeader}>
      <View style={styles.headerLeft}>
        <Text variant="titleLarge" style={styles.headerTitle}>
          Shopping Cart ({itemCount})
        </Text>
        {selectMode && (
          <View style={styles.selectAllContainer}>
            <Checkbox
              status={
                selectedItems.length === 0 ? 'unchecked' :
                selectedItems.length === availableItems.length ? 'checked' : 'indeterminate'
              }
              onPress={handleSelectAll}
            />
            <Text variant="bodyMedium">Select All</Text>
          </View>
        )}
      </View>
      
      <View style={styles.headerActions}>
        {selectMode ? (
          <>
            <Button
              mode="text"
              onPress={handleRemoveSelected}
              disabled={selectedItems.length === 0}
              textColor={theme.colors.error}
              compact
            >
              Remove ({selectedItems.length})
            </Button>
            <Button
              mode="text"
              onPress={() => {
                setSelectMode(false);
                setSelectedItems([]);
              }}
              compact
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              mode="text"
              onPress={() => setSelectMode(true)}
              compact
              icon="checkbox-multiple-outline"
            >
              Select
            </Button>
            <Button
              mode="text"
              onPress={handleClearCart}
              textColor={theme.colors.error}
              compact
              icon="delete-outline"
            >
              Clear
            </Button>
          </>
        )}
      </View>
    </View>
  );

  // Render unavailable items section
  const renderUnavailableItems = () => {
    if (unavailableItems.length === 0) return null;

    return (
      <View style={styles.unavailableSection}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.error }]}>
          Unavailable Items ({unavailableItems.length})
        </Text>
        {unavailableItems.map((item) => (
          <CartItemComponent
            key={item.productId}
            item={item}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveItem}
            onProductPress={handleProductPress}
          />
        ))}
      </View>
    );
  };

  // Render promo code section
  const renderPromoSection = () => (
    <View style={styles.promoSection}>
      <Button
        mode="outlined"
        onPress={() => setShowPromoModal(true)}
        icon="tag-outline"
        style={styles.promoButton}
      >
        {appliedPromo ? `Promo: ${appliedPromo}` : 'Add Promo Code'}
      </Button>
    </View>
  );

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
          <Appbar.Content title="Shopping Cart" />
        </Appbar.Header>
        {renderEmptyCart()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.Content title="Shopping Cart" />
        <Appbar.Action
          icon="storefront-outline"
          onPress={handleContinueShopping}
        />
      </Appbar.Header>

      <FlatList
        data={availableItems}
        renderItem={({ item }) => (
          <CartItemComponent
            item={item}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveItem}
            onProductPress={handleProductPress}
            onToggleSelect={selectMode ? handleToggleSelect : undefined}
            isSelected={selectedItems.includes(item.productId)}
            showSelection={selectMode}
          />
        )}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View>
            {renderCartHeader()}
            {renderUnavailableItems()}
          </View>
        }
        ListFooterComponent={
          <View>
            {renderPromoSection()}
            <CartSummary
              subtotal={cartSubtotal}
              shipping={shipping}
              tax={tax}
              discount={discount}
              total={finalTotal}
              currency="USD"
              itemCount={availableItems.length}
              freeShippingThreshold={50}
              promoCode={appliedPromo || undefined}
              onRemovePromo={handleRemovePromo}
            />
            <View style={styles.bottomSpacing} />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Checkout FAB */}
      {availableItems.length > 0 && (
        <FAB
          icon="cart-arrow-right"
          label={`Checkout • ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(finalTotal)}`}
          onPress={handleCheckout}
          style={[styles.checkoutFab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
        />
      )}

      {/* Promo Code Modal */}
      <Portal>
        <Modal
          visible={showPromoModal}
          onDismiss={() => setShowPromoModal(false)}
          contentContainerStyle={[styles.promoModal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Add Promo Code
          </Text>
          
          <TextInput
            label="Promo Code"
            value={promoCode}
            onChangeText={setPromoCode}
            mode="outlined"
            style={styles.promoInput}
            autoCapitalize="characters"
            placeholder="Enter promo code"
          />
          
          <View style={styles.modalActions}>
            <Button
              mode="text"
              onPress={() => setShowPromoModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleApplyPromo}
              style={styles.modalButton}
              disabled={!promoCode.trim()}
            >
              Apply
            </Button>
          </View>
          
          <Text variant="bodySmall" style={[styles.promoHint, { color: theme.colors.onSurfaceVariant }]}>
            Try "SAVE10" for 10% off your order
          </Text>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  unavailableSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  promoSection: {
    marginVertical: spacing.lg,
  },
  promoButton: {
    borderRadius: borderRadius.md,
  },
  bottomSpacing: {
    height: 100,
  },
  checkoutFab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    left: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  continueShoppingButton: {
    borderRadius: borderRadius.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  promoModal: {
    margin: spacing.xl,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  modalTitle: {
    marginBottom: spacing.lg,
    textAlign: 'center',
    fontWeight: '600',
  },
  promoInput: {
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modalButton: {
    borderRadius: borderRadius.md,
  },
  promoHint: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
