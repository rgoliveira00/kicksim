import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// Types
export interface SearchResult {
  id: string;
  type: 'product' | 'seller' | 'category';
  title: string;
  subtitle?: string;
  image?: string;
  price?: number;
  rating?: number;
  category?: string;
  sellerId?: string;
  sellerName?: string;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'query' | 'product' | 'category' | 'brand';
  count?: number;
}

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  brand?: string;
  seller?: string;
  inStock?: boolean;
  location?: string;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
}

interface SearchState {
  query: string;
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  recentSearches: string[];
  popularSearches: string[];
  filters: SearchFilters;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  searchHistory: SearchHistoryItem[];
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  filters?: SearchFilters;
  resultCount: number;
  timestamp: string;
}

// Initial state
const initialState: SearchState = {
  query: '',
  results: [],
  suggestions: [],
  recentSearches: [],
  popularSearches: [],
  filters: { sortBy: 'relevance' },
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
  searchHistory: [],
};

// Search slice
const searchSlice = createSlice({
  name: 'search',
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
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setResults: (state, action: PayloadAction<SearchResult[]>) => {
      state.results = action.payload;
    },
    addResults: (state, action: PayloadAction<SearchResult[]>) => {
      state.results = [...state.results, ...action.payload];
    },
    clearResults: (state) => {
      state.results = [];
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        hasMore: true,
      };
    },
    setSuggestions: (state, action: PayloadAction<SearchSuggestion[]>) => {
      state.suggestions = action.payload;
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
    },
    setRecentSearches: (state, action: PayloadAction<string[]>) => {
      state.recentSearches = action.payload;
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim();
      if (query && !state.recentSearches.includes(query)) {
        state.recentSearches = [query, ...state.recentSearches.slice(0, 9)]; // Keep last 10
      }
    },
    removeRecentSearch: (state, action: PayloadAction<string>) => {
      state.recentSearches = state.recentSearches.filter(search => search !== action.payload);
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
    setPopularSearches: (state, action: PayloadAction<string[]>) => {
      state.popularSearches = action.payload;
    },
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { sortBy: 'relevance' };
    },
    setPagination: (state, action: PayloadAction<Partial<SearchState['pagination']>>) => {
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
    addToSearchHistory: (state, action: PayloadAction<{ query: string; filters?: SearchFilters; resultCount: number }>) => {
      const { query, filters, resultCount } = action.payload;
      const historyItem: SearchHistoryItem = {
        id: `${Date.now()}_${Math.random()}`,
        query,
        filters,
        resultCount,
        timestamp: new Date().toISOString(),
      };
      
      // Remove existing entry with same query and filters
      state.searchHistory = state.searchHistory.filter(item => 
        !(item.query === query && JSON.stringify(item.filters) === JSON.stringify(filters))
      );
      
      // Add new entry at the beginning
      state.searchHistory.unshift(historyItem);
      
      // Keep only last 50 searches
      state.searchHistory = state.searchHistory.slice(0, 50);
    },
    removeFromSearchHistory: (state, action: PayloadAction<string>) => {
      state.searchHistory = state.searchHistory.filter(item => item.id !== action.payload);
    },
    clearSearchHistory: (state) => {
      state.searchHistory = [];
    },
    performSearch: (state, action: PayloadAction<{ query: string; filters?: SearchFilters }>) => {
      const { query, filters } = action.payload;
      state.query = query;
      if (filters) {
        state.filters = { ...state.filters, ...filters };
      }
      state.results = [];
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        hasMore: true,
      };
      state.isLoading = true;
      state.error = null;
      
      // Add to recent searches
      if (query.trim() && !state.recentSearches.includes(query.trim())) {
        state.recentSearches = [query.trim(), ...state.recentSearches.slice(0, 9)];
      }
    },
  },
});

// Actions
export const {
  setLoading,
  setError,
  clearError,
  setQuery,
  setResults,
  addResults,
  clearResults,
  setSuggestions,
  clearSuggestions,
  setRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  setPopularSearches,
  setFilters,
  updateFilters,
  clearFilters,
  setPagination,
  resetPagination,
  addToSearchHistory,
  removeFromSearchHistory,
  clearSearchHistory,
  performSearch,
} = searchSlice.actions;

// Selectors
export const selectSearch = (state: RootState) => state.search;
export const selectSearchQuery = (state: RootState) => state.search.query;
export const selectSearchResults = (state: RootState) => state.search.results;
export const selectSearchSuggestions = (state: RootState) => state.search.suggestions;
export const selectRecentSearches = (state: RootState) => state.search.recentSearches;
export const selectPopularSearches = (state: RootState) => state.search.popularSearches;
export const selectSearchFilters = (state: RootState) => state.search.filters;
export const selectSearchLoading = (state: RootState) => state.search.isLoading;
export const selectSearchError = (state: RootState) => state.search.error;
export const selectSearchPagination = (state: RootState) => state.search.pagination;
export const selectSearchHistory = (state: RootState) => state.search.searchHistory;

// Computed selectors
export const selectFilteredResults = (state: RootState) => {
  const { results, filters } = state.search;
  
  return results.filter(result => {
    if (result.type !== 'product') return true; // Only filter products
    
    if (filters.category && result.category !== filters.category) return false;
    if (filters.minPrice && result.price && result.price < filters.minPrice) return false;
    if (filters.maxPrice && result.price && result.price > filters.maxPrice) return false;
    if (filters.rating && result.rating && result.rating < filters.rating) return false;
    if (filters.seller && result.sellerName !== filters.seller) return false;
    
    return true;
  }).sort((a, b) => {
    if (a.type !== 'product' || b.type !== 'product') return 0;
    
    switch (filters.sortBy) {
      case 'price_asc':
        return (a.price || 0) - (b.price || 0);
      case 'price_desc':
        return (b.price || 0) - (a.price || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
        // Would need createdAt field for proper sorting
        return 0;
      case 'popular':
        // Would need popularity metric for proper sorting
        return 0;
      case 'relevance':
      default:
        return 0; // Results should already be sorted by relevance from API
    }
  });
};

export const selectProductResults = (state: RootState) =>
  state.search.results.filter(result => result.type === 'product');

export const selectSellerResults = (state: RootState) =>
  state.search.results.filter(result => result.type === 'seller');

export const selectCategoryResults = (state: RootState) =>
  state.search.results.filter(result => result.type === 'category');

export const selectHasActiveFilters = (state: RootState) => {
  const filters = state.search.filters;
  return !!(
    filters.category ||
    filters.subcategory ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.rating ||
    filters.brand ||
    filters.seller ||
    filters.inStock !== undefined ||
    filters.location ||
    (filters.sortBy && filters.sortBy !== 'relevance')
  );
};

export const selectSearchSummary = (state: RootState) => {
  const results = state.search.results;
  const productCount = results.filter(r => r.type === 'product').length;
  const sellerCount = results.filter(r => r.type === 'seller').length;
  const categoryCount = results.filter(r => r.type === 'category').length;
  
  return {
    total: results.length,
    products: productCount,
    sellers: sellerCount,
    categories: categoryCount,
  };
};

export default searchSlice.reducer;

