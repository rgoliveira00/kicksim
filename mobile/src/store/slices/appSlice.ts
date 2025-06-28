import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import NetInfo from '@react-native-community/netinfo';
import { RootState } from '@/store';

// Types
interface AppState {
  isInitialized: boolean;
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  theme: 'light' | 'dark';
  language: string;
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
  };
  onboarding: {
    completed: boolean;
    currentStep: number;
  };
}

// Initial state
const initialState: AppState = {
  isInitialized: false,
  isLoading: false,
  isConnected: true,
  error: null,
  theme: 'light',
  language: 'en',
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
  },
  onboarding: {
    completed: false,
    currentStep: 0,
  },
};

// Async thunks
export const initializeApp = createAsyncThunk(
  'app/initialize',
  async (_, { dispatch }) => {
    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      dispatch(setConnectivity(netInfo.isConnected ?? false));

      // Set up network listener
      NetInfo.addEventListener(state => {
        dispatch(setConnectivity(state.isConnected ?? false));
      });

      // Additional initialization logic can go here
      // e.g., check for app updates, load cached data, etc.

      return true;
    } catch (error) {
      throw new Error('Failed to initialize app');
    }
  }
);

// App slice
const appSlice = createSlice({
  name: 'app',
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
    setConnectivity: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<AppState['notifications']>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    completeOnboarding: (state) => {
      state.onboarding.completed = true;
    },
    setOnboardingStep: (state, action: PayloadAction<number>) => {
      state.onboarding.currentStep = action.payload;
    },
    resetOnboarding: (state) => {
      state.onboarding = {
        completed: false,
        currentStep: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeApp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeApp.fulfilled, (state) => {
        state.isInitialized = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(initializeApp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to initialize app';
      });
  },
});

// Actions
export const {
  setLoading,
  setError,
  clearError,
  setConnectivity,
  setTheme,
  setLanguage,
  updateNotificationSettings,
  completeOnboarding,
  setOnboardingStep,
  resetOnboarding,
} = appSlice.actions;

// Selectors
export const selectApp = (state: RootState) => state.app;
export const selectIsInitialized = (state: RootState) => state.app.isInitialized;
export const selectIsLoading = (state: RootState) => state.app.isLoading;
export const selectIsConnected = (state: RootState) => state.app.isConnected;
export const selectError = (state: RootState) => state.app.error;
export const selectTheme = (state: RootState) => state.app.theme;
export const selectLanguage = (state: RootState) => state.app.language;
export const selectNotificationSettings = (state: RootState) => state.app.notifications;
export const selectOnboarding = (state: RootState) => state.app.onboarding;

export default appSlice.reducer;

