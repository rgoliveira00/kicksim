import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// Types
export interface Review {
  id: string;
  productId: string;
  orderId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isHelpful: number;
  isReported: boolean;
  response?: ReviewResponse;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  id: string;
  sellerId: string;
  sellerName: string;
  content: string;
  createdAt: string;
}

export interface ReviewSummary {
  productId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface ReviewState {
  reviews: Review[];
  productReviews: Record<string, Review[]>; // productId -> reviews
  reviewSummaries: Record<string, ReviewSummary>; // productId -> summary
  currentReview: Review | null;
  isLoading: boolean;
  error: string | null;
  filters: ReviewFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ReviewFilters {
  rating?: number;
  verified?: boolean;
  hasImages?: boolean;
  sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
}

// Initial state
const initialState: ReviewState = {
  reviews: [],
  productReviews: {},
  reviewSummaries: {},
  currentReview: null,
  isLoading: false,
  error: null,
  filters: { sortBy: 'newest' },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
};

// Review slice
const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setReviews: (state, action: PayloadAction<Review[]>) => {
      state.reviews = action.payload;
    },
    addReview: (state, action: PayloadAction<Review>) => {
      const review = action.payload;
      state.reviews.unshift(review);
      
      // Add to product reviews
      if (!state.productReviews[review.productId]) {
        state.productReviews[review.productId] = [];
      }
      state.productReviews[review.productId].unshift(review);
      
      // Update review summary
      updateReviewSummary(state, review.productId);
    },
    updateReview: (state, action: PayloadAction<Review>) => {
      const review = action.payload;
      
      // Update in main reviews array
      const index = state.reviews.findIndex(r => r.id === review.id);
      if (index !== -1) {
        state.reviews[index] = review;
      }
      
      // Update in product reviews
      if (state.productReviews[review.productId]) {
        const productIndex = state.productReviews[review.productId].findIndex(r => r.id === review.id);
        if (productIndex !== -1) {
          state.productReviews[review.productId][productIndex] = review;
        }
      }
      
      // Update current review if it matches
      if (state.currentReview?.id === review.id) {
        state.currentReview = review;
      }
      
      // Update review summary
      updateReviewSummary(state, review.productId);
    },
    removeReview: (state, action: PayloadAction<string>) => {
      const reviewId = action.payload;
      const review = state.reviews.find(r => r.id === reviewId);
      
      if (review) {
        // Remove from main reviews array
        state.reviews = state.reviews.filter(r => r.id !== reviewId);
        
        // Remove from product reviews
        if (state.productReviews[review.productId]) {
          state.productReviews[review.productId] = state.productReviews[review.productId].filter(r => r.id !== reviewId);
        }
        
        // Clear current review if it matches
        if (state.currentReview?.id === reviewId) {
          state.currentReview = null;
        }
        
        // Update review summary
        updateReviewSummary(state, review.productId);
      }
    },
    setProductReviews: (state, action: PayloadAction<{ productId: string; reviews: Review[] }>) => {
      const { productId, reviews } = action.payload;
      state.productReviews[productId] = reviews;
      updateReviewSummary(state, productId);
    },
    addProductReviews: (state, action: PayloadAction<{ productId: string; reviews: Review[] }>) => {
      const { productId, reviews } = action.payload;
      if (!state.productReviews[productId]) {
        state.productReviews[productId] = [];
      }
      state.productReviews[productId] = [...state.productReviews[productId], ...reviews];
      updateReviewSummary(state, productId);
    },
    setReviewSummary: (state, action: PayloadAction<ReviewSummary>) => {
      const summary = action.payload;
      state.reviewSummaries[summary.productId] = summary;
    },
    setCurrentReview: (state, action: PayloadAction<Review | null>) => {
      state.currentReview = action.payload;
    },
    addReviewResponse: (state, action: PayloadAction<{ reviewId: string; response: ReviewResponse }>) => {
      const { reviewId, response } = action.payload;
      
      // Update in main reviews array
      const review = state.reviews.find(r => r.id === reviewId);
      if (review) {
        review.response = response;
        review.updatedAt = new Date().toISOString();
      }
      
      // Update in product reviews
      Object.values(state.productReviews).forEach(productReviews => {
        const productReview = productReviews.find(r => r.id === reviewId);
        if (productReview) {
          productReview.response = response;
          productReview.updatedAt = new Date().toISOString();
        }
      });
      
      // Update current review if it matches
      if (state.currentReview?.id === reviewId) {
        state.currentReview.response = response;
        state.currentReview.updatedAt = new Date().toISOString();
      }
    },
    markReviewHelpful: (state, action: PayloadAction<{ reviewId: string; isHelpful: boolean }>) => {
      const { reviewId, isHelpful } = action.payload;
      
      const updateHelpful = (review: Review) => {
        if (isHelpful) {
          review.isHelpful += 1;
        } else {
          review.isHelpful = Math.max(0, review.isHelpful - 1);
        }
      };
      
      // Update in main reviews array
      const review = state.reviews.find(r => r.id === reviewId);
      if (review) {
        updateHelpful(review);
      }
      
      // Update in product reviews
      Object.values(state.productReviews).forEach(productReviews => {
        const productReview = productReviews.find(r => r.id === reviewId);
        if (productReview) {
          updateHelpful(productReview);
        }
      });
      
      // Update current review if it matches
      if (state.currentReview?.id === reviewId) {
        updateHelpful(state.currentReview);
      }
    },
    reportReview: (state, action: PayloadAction<string>) => {
      const reviewId = action.payload;
      
      const markReported = (review: Review) => {
        review.isReported = true;
      };
      
      // Update in main reviews array
      const review = state.reviews.find(r => r.id === reviewId);
      if (review) {
        markReported(review);
      }
      
      // Update in product reviews
      Object.values(state.productReviews).forEach(productReviews => {
        const productReview = productReviews.find(r => r.id === reviewId);
        if (productReview) {
          markReported(productReview);
        }
      });
      
      // Update current review if it matches
      if (state.currentReview?.id === reviewId) {
        markReported(state.currentReview);
      }
    },
    setFilters: (state, action: PayloadAction<ReviewFilters>) => {
      state.filters = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<ReviewFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { sortBy: 'newest' };
    },
    setPagination: (state, action: PayloadAction<Partial<ReviewState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetPagination: (state) => {
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        hasMore: true,
      };
    },
    clearReviews: (state) => {
      state.reviews = [];
      state.productReviews = {};
      state.reviewSummaries = {};
      state.currentReview = null;
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        hasMore: true,
      };
    },
  },
});

// Helper function to update review summary
const updateReviewSummary = (state: ReviewState, productId: string) => {
  const reviews = state.productReviews[productId] || [];
  
  if (reviews.length === 0) {
    delete state.reviewSummaries[productId];
    return;
  }
  
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
  
  const ratingDistribution = {
    1: reviews.filter(r => r.rating === 1).length,
    2: reviews.filter(r => r.rating === 2).length,
    3: reviews.filter(r => r.rating === 3).length,
    4: reviews.filter(r => r.rating === 4).length,
    5: reviews.filter(r => r.rating === 5).length,
  };
  
  state.reviewSummaries[productId] = {
    productId,
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
    ratingDistribution,
  };
};

// Actions
export const {
  setLoading,
  setError,
  clearError,
  setReviews,
  addReview,
  updateReview,
  removeReview,
  setProductReviews,
  addProductReviews,
  setReviewSummary,
  setCurrentReview,
  addReviewResponse,
  markReviewHelpful,
  reportReview,
  setFilters,
  updateFilters,
  clearFilters,
  setPagination,
  resetPagination,
  clearReviews,
} = reviewSlice.actions;

// Selectors
export const selectReviews = (state: RootState) => state.reviews;
export const selectReviewsList = (state: RootState) => state.reviews.reviews;
export const selectCurrentReview = (state: RootState) => state.reviews.currentReview;
export const selectReviewsLoading = (state: RootState) => state.reviews.isLoading;
export const selectReviewsError = (state: RootState) => state.reviews.error;
export const selectReviewFilters = (state: RootState) => state.reviews.filters;
export const selectReviewPagination = (state: RootState) => state.reviews.pagination;

// Computed selectors
export const selectProductReviews = (state: RootState, productId: string) =>
  state.reviews.productReviews[productId] || [];

export const selectReviewSummary = (state: RootState, productId: string) =>
  state.reviews.reviewSummaries[productId];

export const selectFilteredProductReviews = (state: RootState, productId: string) => {
  const reviews = state.reviews.productReviews[productId] || [];
  const filters = state.reviews.filters;
  
  return reviews.filter(review => {
    if (filters.rating && review.rating !== filters.rating) return false;
    if (filters.verified !== undefined && review.isVerifiedPurchase !== filters.verified) return false;
    if (filters.hasImages && (!review.images || review.images.length === 0)) return false;
    
    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'rating_high':
        return b.rating - a.rating;
      case 'rating_low':
        return a.rating - b.rating;
      case 'helpful':
        return b.isHelpful - a.isHelpful;
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
};

export const selectUserReviews = (state: RootState, userId: string) =>
  state.reviews.reviews.filter(review => review.userId === userId);

export const selectReviewById = (state: RootState, reviewId: string) =>
  state.reviews.reviews.find(review => review.id === reviewId);

export default reviewSlice.reducer;

