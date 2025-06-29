import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Share,
  Animated,
} from 'react-native';
import {
  Text,
  Button,
  Chip,
  Card,
  Divider,
  useTheme,
  Appbar,
  FAB,
  Portal,
  Modal,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  fetchProductById,
  selectProductById,
  selectProductsLoading,
  selectProductsError,
} from '@/store/slices/productSlice';
import { addToCart, selectCartItems } from '@/store/slices/cartSlice';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Product, ProductCondition } from '@/types/product';
import { spacing, borderRadius } from '@/constants/theme';

type ProductDetailScreenNavigationProp = StackNavigationProp<any, 'ProductDetail'>;
type ProductDetailScreenRouteProp = RouteProp<any, 'ProductDetail'>;

interface Props {
  navigation: ProductDetailScreenNavigationProp;
  route: ProductDetailScreenRouteProp;
}

const { width, height } = Dimensions.get('window');
const IMAGE_HEIGHT = width;

export const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Route params
  const { productId } = route.params;

  // Redux state
  const product = useAppSelector(state => selectProductById(state, productId));
  const isLoading = useAppSelector(selectProductsLoading);
  const error = useAppSelector(selectProductsError);
  const cartItems = useAppSelector(selectCartItems);

  // Local state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Load product on mount
  useEffect(() => {
    if (!product) {
      dispatch(fetchProductById(productId));
    }
  }, [productId, product, dispatch]);

  // Check if product is in cart
  const isInCart = cartItems.some(item => item.productId === productId);
  const cartQuantity = cartItems.find(item => item.productId === productId)?.quantity || 0;

  // Handle add to cart
  const handleAddToCart = () => {
    dispatch(addToCart({ productId, quantity }));
    // Show toast notification
  };

  // Handle buy now
  const handleBuyNow = () => {
    dispatch(addToCart({ productId, quantity }));
    navigation.navigate('Checkout');
  };

  // Handle share
  const handleShare = async () => {
    if (!product) return;
    
    try {
      await Share.share({
        message: `Check out this ${product.title} for ${formatPrice(product.price, product.currency)}`,
        url: `https://marketplace.app/product/${product.id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Handle contact seller
  const handleContactSeller = () => {
    if (!product) return;
    navigation.navigate('Message', { 
      sellerId: product.seller.id,
      productId: product.id 
    });
  };

  // Format price
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  // Get condition color
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

  // Get condition label
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

  // Render stars
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="star" size={16} color={theme.colors.tertiary} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="star-half-full" size={16} color={theme.colors.tertiary} />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="star-outline" size={16} color={theme.colors.outline} />
      );
    }

    return stars;
  };

  // Render image gallery
  const renderImageGallery = () => {
    if (!product || !product.images.length) return null;

    return (
      <View style={styles.imageContainer}>
        <TouchableOpacity
          onPress={() => setShowImageModal(true)}
          style={styles.mainImageContainer}
        >
          <FastImage
            source={{ uri: product.images[selectedImageIndex] }}
            style={styles.mainImage}
            resizeMode={FastImage.resizeMode.cover}
          />
          
          {product.featured && (
            <View style={[styles.featuredBadge, { backgroundColor: theme.colors.primary }]}>
              <Text variant="labelSmall" style={{ color: theme.colors.onPrimary }}>
                Featured
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => setIsInWishlist(!isInWishlist)}
            style={[styles.wishlistButton, { backgroundColor: theme.colors.surface }]}
          >
            <Icon
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={24}
              color={isInWishlist ? theme.colors.error : theme.colors.outline}
            />
          </TouchableOpacity>
        </TouchableOpacity>

        {product.images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailContainer}
            contentContainerStyle={styles.thumbnailContent}
          >
            {product.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImageIndex(index)}
                style={[
                  styles.thumbnail,
                  selectedImageIndex === index && {
                    borderColor: theme.colors.primary,
                    borderWidth: 2,
                  },
                ]}
              >
                <FastImage
                  source={{ uri: image }}
                  style={styles.thumbnailImage}
                  resizeMode={FastImage.resizeMode.cover}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  // Render product info
  const renderProductInfo = () => {
    if (!product) return null;

    return (
      <View style={styles.productInfo}>
        <Text variant="headlineSmall" style={styles.title}>
          {product.title}
        </Text>

        <View style={styles.priceContainer}>
          <Text variant="headlineMedium" style={[styles.price, { color: theme.colors.primary }]}>
            {formatPrice(product.price, product.currency)}
          </Text>
          {product.originalPrice && product.originalPrice > product.price && (
            <Text
              variant="titleMedium"
              style={[styles.originalPrice, { color: theme.colors.onSurfaceVariant }]}
            >
              {formatPrice(product.originalPrice, product.currency)}
            </Text>
          )}
        </View>

        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {renderStars(product.rating.average)}
          </View>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {product.rating.average.toFixed(1)} ({product.rating.totalReviews} reviews)
          </Text>
        </View>

        <View style={styles.badges}>
          <Chip
            mode="flat"
            style={[
              styles.conditionChip,
              { backgroundColor: `${getConditionColor(product.condition)}20` }
            ]}
            textStyle={{ color: getConditionColor(product.condition) }}
          >
            {getConditionLabel(product.condition)}
          </Chip>
          
          {product.shipping.free && (
            <Chip
              mode="flat"
              style={[styles.badge, { backgroundColor: theme.colors.secondaryContainer }]}
            >
              Free Shipping
            </Chip>
          )}
          
          {product.stock <= 5 && product.stock > 0 && (
            <Chip
              mode="flat"
              style={[styles.badge, { backgroundColor: theme.colors.errorContainer }]}
              textStyle={{ color: theme.colors.error }}
            >
              Only {product.stock} left
            </Chip>
          )}
        </View>
      </View>
    );
  };

  // Render seller info
  const renderSellerInfo = () => {
    if (!product) return null;

    return (
      <Card style={[styles.sellerCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.sellerContent}>
          <View style={styles.sellerHeader}>
            <Text variant="titleMedium">Sold by</Text>
            <Button mode="outlined" onPress={handleContactSeller} compact>
              Contact
            </Button>
          </View>
          
          <View style={styles.sellerInfo}>
            <View style={styles.sellerDetails}>
              <Text variant="titleMedium" style={styles.sellerName}>
                {product.seller.name}
                {product.seller.verified && (
                  <Icon name="check-decagram" size={16} color={theme.colors.primary} />
                )}
              </Text>
              
              <View style={styles.sellerRating}>
                <View style={styles.stars}>
                  {renderStars(product.seller.rating)}
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {product.seller.rating.toFixed(1)} ({product.seller.totalReviews} reviews)
                </Text>
              </View>
              
              {product.seller.location && (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  <Icon name="map-marker" size={12} /> {product.seller.location}
                </Text>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Render description
  const renderDescription = () => {
    if (!product) return null;

    return (
      <Card style={[styles.descriptionCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Description
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            {product.description}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  // Render specifications
  const renderSpecifications = () => {
    if (!product || !product.specifications.length) return null;

    return (
      <Card style={[styles.specificationsCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Specifications
          </Text>
          {product.specifications.map((spec, index) => (
            <View key={index} style={styles.specificationRow}>
              <Text variant="bodyMedium" style={styles.specName}>
                {spec.name}
              </Text>
              <Text variant="bodyMedium" style={styles.specValue}>
                {spec.value} {spec.unit || ''}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    );
  };

  // Render shipping info
  const renderShippingInfo = () => {
    if (!product) return null;

    return (
      <Card style={[styles.shippingCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Shipping Information
          </Text>
          
          <View style={styles.shippingRow}>
            <Icon name="truck-delivery" size={20} color={theme.colors.primary} />
            <View style={styles.shippingDetails}>
              <Text variant="bodyMedium">
                {product.shipping.free ? 'Free Shipping' : `Shipping: ${formatPrice(product.shipping.cost || 0, product.currency)}`}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Estimated delivery: {product.shipping.estimatedDays.min}-{product.shipping.estimatedDays.max} days
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Render quantity selector
  const renderQuantitySelector = () => {
    if (!product) return null;

    return (
      <View style={styles.quantityContainer}>
        <Text variant="titleMedium">Quantity</Text>
        <View style={styles.quantitySelector}>
          <TouchableOpacity
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={[styles.quantityButton, { backgroundColor: theme.colors.surfaceVariant }]}
            disabled={quantity <= 1}
          >
            <Icon name="minus" size={20} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
          
          <Text variant="titleMedium" style={styles.quantityText}>
            {quantity}
          </Text>
          
          <TouchableOpacity
            onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
            style={[styles.quantityButton, { backgroundColor: theme.colors.surfaceVariant }]}
            disabled={quantity >= product.stock}
          >
            <Icon name="plus" size={20} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Loading state
  if (isLoading) {
    return <LoadingScreen message="Loading product details..." />;
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Product Details" />
        </Appbar.Header>
        
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text variant="titleMedium" style={[styles.errorTitle, { color: theme.colors.error }]}>
            Error Loading Product
          </Text>
          <Text variant="bodyMedium" style={[styles.errorMessage, { color: theme.colors.onSurfaceVariant }]}>
            {error}
          </Text>
          <Button mode="contained" onPress={() => dispatch(fetchProductById(productId))}>
            Try Again
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Product not found
  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Product Details" />
        </Appbar.Header>
        
        <View style={styles.errorContainer}>
          <Icon name="package-variant-closed" size={48} color={theme.colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
            Product Not Found
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            This product may have been removed or is no longer available.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="" />
        <Appbar.Action icon="share-variant" onPress={handleShare} />
      </Appbar.Header>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {renderImageGallery()}
        {renderProductInfo()}
        {renderSellerInfo()}
        {renderDescription()}
        {renderSpecifications()}
        {renderShippingInfo()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { backgroundColor: theme.colors.surface }]}>
        {renderQuantitySelector()}
        
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={handleAddToCart}
            style={[styles.actionButton, styles.addToCartButton]}
            disabled={product.stock === 0}
          >
            {isInCart ? `In Cart (${cartQuantity})` : 'Add to Cart'}
          </Button>
          
          <Button
            mode="contained"
            onPress={handleBuyNow}
            style={[styles.actionButton, styles.buyNowButton]}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
          </Button>
        </View>
      </View>

      {/* Image Modal */}
      <Portal>
        <Modal
          visible={showImageModal}
          onDismiss={() => setShowImageModal(false)}
          contentContainerStyle={styles.imageModal}
        >
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowImageModal(false)}
          >
            <Icon name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <FastImage
            source={{ uri: product.images[selectedImageIndex] }}
            style={styles.modalImage}
            resizeMode={FastImage.resizeMode.contain}
          />
        </Modal>
      </Portal>
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
  imageContainer: {
    backgroundColor: 'white',
  },
  mainImageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: IMAGE_HEIGHT,
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  wishlistButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  thumbnailContainer: {
    paddingVertical: spacing.sm,
  },
  thumbnailContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
    lineHeight: 28,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  price: {
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stars: {
    flexDirection: 'row',
    marginRight: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badge: {
    marginBottom: spacing.xs,
  },
  conditionChip: {
    marginBottom: spacing.xs,
  },
  sellerCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },
  sellerContent: {
    padding: spacing.md,
  },
  sellerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    marginBottom: spacing.xs,
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  descriptionCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  description: {
    lineHeight: 22,
  },
  specificationsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },
  specificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  specName: {
    flex: 1,
    fontWeight: '500',
  },
  specValue: {
    flex: 1,
    textAlign: 'right',
  },
  shippingCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shippingDetails: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  bottomSpacing: {
    height: 100,
  },
  bottomActions: {
    padding: spacing.lg,
    elevation: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: spacing.md,
    minWidth: 30,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
  addToCartButton: {},
  buyNowButton: {},
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
  imageModal: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width,
    height: height * 0.8,
  },
});
