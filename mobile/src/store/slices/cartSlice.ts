import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// Types
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sellerId: string;
  sellerName: string;
  variant?: {
    size?: string;
    color?: string;
    [key: string]: any;
  };
  maxQuantity: number;
  isAvailable: boolean;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
}

// Initial state
const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
  error: null,
  lastUpdated: 0,
};

// Helper functions
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

// Async thunks
export const syncCartWithServer = createAsyncThunk(
  'cart/syncWithServer',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const cartItems = state.cart.items;
      
      // TODO: Implement API call to sync cart with server
      // const response = await cartService.syncCart(cartItems);
      
      return cartItems; // Placeholder
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sync cart');
    }
  }
);

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Omit<CartItem, 'id'>>) => {
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => 
          item.productId === newItem.productId && 
          JSON.stringify(item.variant) === JSON.stringify(newItem.variant)
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const existingItem = state.items[existingItemIndex];
        const newQuantity = Math.min(
          existingItem.quantity + newItem.quantity,
          existingItem.maxQuantity
        );
        state.items[existingItemIndex].quantity = newQuantity;
      } else {
        // Add new item
        const cartItem: CartItem = {
          ...newItem,
          id: `${newItem.productId}_${Date.now()}`,
          quantity: Math.min(newItem.quantity, newItem.maxQuantity),
        };
        state.items.push(cartItem);
      }

      state.total = calculateTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
      state.lastUpdated = Date.now();
    },

    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.total = calculateTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
      state.lastUpdated = Date.now();
    },

    updateItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === id);
      
      if (itemIndex >= 0) {
        const item = state.items[itemIndex];
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.items.splice(itemIndex, 1);
        } else {
          // Update quantity (respect max quantity)
          state.items[itemIndex].quantity = Math.min(quantity, item.maxQuantity);
        }
        
        state.total = calculateTotal(state.items);
        state.itemCount = calculateItemCount(state.items);
        state.lastUpdated = Date.now();
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
      state.lastUpdated = Date.now();
    },

    updateItemAvailability: (state, action: PayloadAction<{ productId: string; isAvailable: boolean; maxQuantity?: number }>) => {
      const { productId, isAvailable, maxQuantity } = action.payload;
      
      state.items.forEach(item => {
        if (item.productId === productId) {
          item.isAvailable = isAvailable;
          if (maxQuantity !== undefined) {
            item.maxQuantity = maxQuantity;
            // Adjust quantity if it exceeds new max
            if (item.quantity > maxQuantity) {
              item.quantity = maxQuantity;
            }
          }
        }
      });

      state.total = calculateTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
      state.lastUpdated = Date.now();
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Bulk operations
    addMultipleItems: (state, action: PayloadAction<Omit<CartItem, 'id'>[]>) => {
      action.payload.forEach(newItem => {
        const existingItemIndex = state.items.findIndex(
          item => 
            item.productId === newItem.productId && 
            JSON.stringify(item.variant) === JSON.stringify(newItem.variant)
        );

        if (existingItemIndex >= 0) {
          const existingItem = state.items[existingItemIndex];
          const newQuantity = Math.min(
            existingItem.quantity + newItem.quantity,
            existingItem.maxQuantity
          );
          state.items[existingItemIndex].quantity = newQuantity;
        } else {
          const cartItem: CartItem = {
            ...newItem,
            id: `${newItem.productId}_${Date.now()}_${Math.random()}`,
            quantity: Math.min(newItem.quantity, newItem.maxQuantity),
          };
          state.items.push(cartItem);
        }
      });

      state.total = calculateTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
      state.lastUpdated = Date.now();
    },

    removeMultipleItems: (state, action: PayloadAction<string[]>) => {
      state.items = state.items.filter(item => !action.payload.includes(item.id));
      state.total = calculateTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
      state.lastUpdated = Date.now();
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(syncCartWithServer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncCartWithServer.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update cart with server response if needed
        state.lastUpdated = Date.now();
      })
      .addCase(syncCartWithServer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  addItem,
  removeItem,
  updateItemQuantity,
  clearCart,
  updateItemAvailability,
  setLoading,
  setError,
  clearError,
  addMultipleItems,
  removeMultipleItems,
} = cartSlice.actions;

// Selectors
export const selectCart = (state: RootState) => state.cart;
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartTotal = (state: RootState) => state.cart.total;
export const selectCartItemCount = (state: RootState) => state.cart.itemCount;
export const selectCartLoading = (state: RootState) => state.cart.isLoading;
export const selectCartError = (state: RootState) => state.cart.error;
export const selectCartLastUpdated = (state: RootState) => state.cart.lastUpdated;

// Computed selectors
export const selectCartItemById = (state: RootState, itemId: string) =>
  state.cart.items.find(item => item.id === itemId);

export const selectCartItemsByProductId = (state: RootState, productId: string) =>
  state.cart.items.filter(item => item.productId === productId);

export const selectCartItemsBySeller = (state: RootState, sellerId: string) =>
  state.cart.items.filter(item => item.sellerId === sellerId);

export const selectUnavailableCartItems = (state: RootState) =>
  state.cart.items.filter(item => !item.isAvailable);

export const selectCartSummary = (state: RootState) => ({
  itemCount: state.cart.itemCount,
  total: state.cart.total,
  uniqueProducts: state.cart.items.length,
  sellers: [...new Set(state.cart.items.map(item => item.sellerId))].length,
});

export default cartSlice.reducer;

