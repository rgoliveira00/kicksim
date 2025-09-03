import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// Types
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  variant?: Record<string, string>;
  sellerId: string;
  sellerName: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: Address;
  billingAddress?: Address;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  addresses: Address[];
  isLoading: boolean;
  error: string | null;
  filters: OrderFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface OrderFilters {
  status?: Order['status'];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Initial state
const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  addresses: [],
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
};

// Order slice
const orderSlice = createSlice({
  name: 'orders',
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
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    addOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = [...state.orders, ...action.payload];
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex(order => order.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      if (state.currentOrder?.id === action.payload.id) {
        state.currentOrder = action.payload;
      }
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: Order['status']; trackingNumber?: string }>) => {
      const { orderId, status, trackingNumber } = action.payload;
      const order = state.orders.find(order => order.id === orderId);
      if (order) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
        if (trackingNumber) {
          order.trackingNumber = trackingNumber;
        }
        if (status === 'delivered') {
          order.deliveredAt = new Date().toISOString();
        }
      }
      if (state.currentOrder?.id === orderId) {
        state.currentOrder.status = status;
        state.currentOrder.updatedAt = new Date().toISOString();
        if (trackingNumber) {
          state.currentOrder.trackingNumber = trackingNumber;
        }
        if (status === 'delivered') {
          state.currentOrder.deliveredAt = new Date().toISOString();
        }
      }
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    setAddresses: (state, action: PayloadAction<Address[]>) => {
      state.addresses = action.payload;
    },
    addAddress: (state, action: PayloadAction<Address>) => {
      state.addresses.push(action.payload);
    },
    updateAddress: (state, action: PayloadAction<Address>) => {
      const index = state.addresses.findIndex(addr => addr.id === action.payload.id);
      if (index !== -1) {
        state.addresses[index] = action.payload;
      }
    },
    removeAddress: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.filter(addr => addr.id !== action.payload);
    },
    setDefaultAddress: (state, action: PayloadAction<string>) => {
      state.addresses.forEach(addr => {
        addr.isDefault = addr.id === action.payload;
      });
    },
    setFilters: (state, action: PayloadAction<OrderFilters>) => {
      state.filters = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<OrderFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setPagination: (state, action: PayloadAction<Partial<OrderState['pagination']>>) => {
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
    clearOrders: (state) => {
      state.orders = [];
      state.currentOrder = null;
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        hasMore: true,
      };
    },
  },
});

// Actions
export const {
  setLoading,
  setError,
  clearError,
  setOrders,
  addOrders,
  addOrder,
  updateOrder,
  updateOrderStatus,
  setCurrentOrder,
  setAddresses,
  addAddress,
  updateAddress,
  removeAddress,
  setDefaultAddress,
  setFilters,
  updateFilters,
  clearFilters,
  setPagination,
  resetPagination,
  clearOrders,
} = orderSlice.actions;

// Selectors
export const selectOrders = (state: RootState) => state.orders;
export const selectOrdersList = (state: RootState) => state.orders.orders;
export const selectCurrentOrder = (state: RootState) => state.orders.currentOrder;
export const selectAddresses = (state: RootState) => state.orders.addresses;
export const selectOrdersLoading = (state: RootState) => state.orders.isLoading;
export const selectOrdersError = (state: RootState) => state.orders.error;
export const selectOrderFilters = (state: RootState) => state.orders.filters;
export const selectOrderPagination = (state: RootState) => state.orders.pagination;

// Computed selectors
export const selectOrderById = (state: RootState, orderId: string) =>
  state.orders.orders.find(order => order.id === orderId);

export const selectOrdersByStatus = (state: RootState, status: Order['status']) =>
  state.orders.orders.filter(order => order.status === status);

export const selectPendingOrders = (state: RootState) =>
  state.orders.orders.filter(order => 
    ['pending', 'confirmed', 'processing'].includes(order.status)
  );

export const selectCompletedOrders = (state: RootState) =>
  state.orders.orders.filter(order => 
    ['delivered'].includes(order.status)
  );

export const selectDefaultAddress = (state: RootState) =>
  state.orders.addresses.find(addr => addr.isDefault);

export const selectFilteredOrders = (state: RootState) => {
  const { orders, filters } = state.orders;
  
  return orders.filter(order => {
    if (filters.status && order.status !== filters.status) return false;
    if (filters.minAmount && order.total < filters.minAmount) return false;
    if (filters.maxAmount && order.total > filters.maxAmount) return false;
    if (filters.dateFrom && new Date(order.createdAt) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(order.createdAt) > new Date(filters.dateTo)) return false;
    
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const selectOrderStats = (state: RootState) => {
  const orders = state.orders.orders;
  
  return {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalSpent: orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0),
  };
};

export default orderSlice.reducer;

