export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number; // For discounted items
  currency: string;
  images: string[];
  category: Category;
  subcategory?: string;
  brand?: string;
  condition: ProductCondition;
  availability: ProductAvailability;
  stock: number;
  seller: Seller;
  specifications: ProductSpecification[];
  tags: string[];
  rating: ProductRating;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  shipping: ShippingInfo;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  parentId?: string;
  subcategories?: Category[];
}

export interface Seller {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  totalReviews: number;
  verified: boolean;
  location?: string;
  joinedDate: string;
}

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
}

export interface ProductRating {
  average: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ShippingInfo {
  free: boolean;
  cost?: number;
  estimatedDays: {
    min: number;
    max: number;
  };
  methods: ShippingMethod[];
}

export interface ShippingMethod {
  id: string;
  name: string;
  cost: number;
  estimatedDays: {
    min: number;
    max: number;
  };
}

export enum ProductCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

export enum ProductAvailability {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductCondition[];
  brand?: string[];
  rating?: number;
  freeShipping?: boolean;
  inStock?: boolean;
  location?: string;
  sortBy?: ProductSortOption;
  sortOrder?: 'asc' | 'desc';
}

export enum ProductSortOption {
  RELEVANCE = 'relevance',
  PRICE_LOW_TO_HIGH = 'price_asc',
  PRICE_HIGH_TO_LOW = 'price_desc',
  NEWEST = 'newest',
  OLDEST = 'oldest',
  RATING = 'rating',
  POPULARITY = 'popularity',
  DISTANCE = 'distance',
}

export interface ProductSearchParams {
  query?: string;
  filters?: ProductFilters;
  page?: number;
  limit?: number;
}

export interface ProductSearchResponse {
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  filters: {
    categories: Category[];
    brands: string[];
    priceRange: {
      min: number;
      max: number;
    };
  };
}

export interface ProductListItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  currency: string;
  image: string;
  rating: number;
  reviewCount: number;
  seller: {
    name: string;
    verified: boolean;
  };
  condition: ProductCondition;
  freeShipping: boolean;
  featured: boolean;
}

// Wishlist types
export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

// Recently viewed types
export interface RecentlyViewedItem {
  productId: string;
  viewedAt: string;
}

// Product comparison types
export interface ProductComparison {
  products: Product[];
  specifications: string[];
}

