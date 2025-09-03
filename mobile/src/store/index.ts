import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import all slice reducers
import appReducer from './slices/appSlice';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import messageReducer from './slices/messageSlice';
import reviewReducer from './slices/reviewSlice';
import searchReducer from './slices/searchSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'cart'], // Only persist these reducers
  blacklist: ['app', 'products', 'orders', 'messages', 'reviews', 'search'], // Don't persist these
};

// Auth persist configuration (separate for sensitive data)
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['isAuthenticated', 'user', 'tokens'], // Persist auth state
};

// Cart persist configuration
const cartPersistConfig = {
  key: 'cart',
  storage: AsyncStorage,
  whitelist: ['items', 'total'], // Persist cart items
};

// Root reducer
const rootReducer = combineReducers({
  app: appReducer,
  auth: persistReducer(authPersistConfig, authReducer),
  user: userReducer,
  products: productReducer,
  cart: persistReducer(cartPersistConfig, cartReducer),
  orders: orderReducer,
  messages: messageReducer,
  reviews: reviewReducer,
  search: searchReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH',
        ],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates'],
      },
      immutableCheck: {
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: __DEV__,
});

// Persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks will be defined in hooks/redux.ts

