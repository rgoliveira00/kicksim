import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// Types
interface UserPreferences {
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    showPhone: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    currency: string;
    timezone: string;
  };
}

interface UserState {
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: UserState = {
  preferences: {
    notifications: {
      push: true,
      email: true,
      sms: false,
      marketing: false,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
    },
    display: {
      theme: 'system',
      language: 'en',
      currency: 'USD',
      timezone: 'UTC',
    },
  },
  isLoading: false,
  error: null,
};

// User slice
const userSlice = createSlice({
  name: 'user',
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
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    updateNotificationPreferences: (state, action: PayloadAction<Partial<UserPreferences['notifications']>>) => {
      state.preferences.notifications = { ...state.preferences.notifications, ...action.payload };
    },
    updatePrivacyPreferences: (state, action: PayloadAction<Partial<UserPreferences['privacy']>>) => {
      state.preferences.privacy = { ...state.preferences.privacy, ...action.payload };
    },
    updateDisplayPreferences: (state, action: PayloadAction<Partial<UserPreferences['display']>>) => {
      state.preferences.display = { ...state.preferences.display, ...action.payload };
    },
    resetPreferences: (state) => {
      state.preferences = initialState.preferences;
    },
  },
});

// Actions
export const {
  setLoading,
  setError,
  clearError,
  updatePreferences,
  updateNotificationPreferences,
  updatePrivacyPreferences,
  updateDisplayPreferences,
  resetPreferences,
} = userSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.user;
export const selectUserPreferences = (state: RootState) => state.user.preferences;
export const selectNotificationPreferences = (state: RootState) => state.user.preferences.notifications;
export const selectPrivacyPreferences = (state: RootState) => state.user.preferences.privacy;
export const selectDisplayPreferences = (state: RootState) => state.user.preferences.display;
export const selectUserLoading = (state: RootState) => state.user.isLoading;
export const selectUserError = (state: RootState) => state.user.error;

export default userSlice.reducer;

