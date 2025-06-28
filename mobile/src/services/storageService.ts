import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { AuthTokens } from '@/store/slices/authSlice';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKENS: 'auth_tokens',
  USER_PREFERENCES: 'user_preferences',
  CART_DATA: 'cart_data',
  SEARCH_HISTORY: 'search_history',
  ONBOARDING_STATUS: 'onboarding_status',
} as const;

// Keychain service name for secure storage
const KEYCHAIN_SERVICE = 'MarketplaceApp';

class StorageService {
  /**
   * Store authentication tokens securely in Keychain
   */
  async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      const tokenData = JSON.stringify(tokens);
      await Keychain.setInternetCredentials(
        KEYCHAIN_SERVICE,
        'auth_tokens',
        tokenData
      );
    } catch (error) {
      console.error('Failed to store tokens securely:', error);
      // Fallback to AsyncStorage (less secure but functional)
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(tokens));
    }
  }

  /**
   * Retrieve authentication tokens from secure storage
   */
  async getTokens(): Promise<AuthTokens | null> {
    try {
      // Try to get from Keychain first
      const credentials = await Keychain.getInternetCredentials(KEYCHAIN_SERVICE);
      if (credentials && credentials.password) {
        return JSON.parse(credentials.password);
      }
    } catch (error) {
      console.warn('Failed to retrieve tokens from Keychain:', error);
    }

    try {
      // Fallback to AsyncStorage
      const tokenData = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKENS);
      return tokenData ? JSON.parse(tokenData) : null;
    } catch (error) {
      console.error('Failed to retrieve tokens from AsyncStorage:', error);
      return null;
    }
  }

  /**
   * Clear authentication tokens from secure storage
   */
  async clearTokens(): Promise<void> {
    try {
      // Clear from Keychain
      await Keychain.resetInternetCredentials(KEYCHAIN_SERVICE);
    } catch (error) {
      console.warn('Failed to clear tokens from Keychain:', error);
    }

    try {
      // Clear from AsyncStorage
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKENS);
    } catch (error) {
      console.error('Failed to clear tokens from AsyncStorage:', error);
    }
  }

  /**
   * Store user preferences
   */
  async storeUserPreferences(preferences: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Failed to store user preferences:', error);
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(): Promise<Record<string, any> | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return null;
    }
  }

  /**
   * Store cart data
   */
  async storeCartData(cartData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CART_DATA,
        JSON.stringify(cartData)
      );
    } catch (error) {
      console.error('Failed to store cart data:', error);
    }
  }

  /**
   * Get cart data
   */
  async getCartData(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CART_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get cart data:', error);
      return null;
    }
  }

  /**
   * Clear cart data
   */
  async clearCartData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CART_DATA);
    } catch (error) {
      console.error('Failed to clear cart data:', error);
    }
  }

  /**
   * Store search history
   */
  async storeSearchHistory(history: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SEARCH_HISTORY,
        JSON.stringify(history)
      );
    } catch (error) {
      console.error('Failed to store search history:', error);
    }
  }

  /**
   * Get search history
   */
  async getSearchHistory(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get search history:', error);
      return [];
    }
  }

  /**
   * Add search term to history
   */
  async addSearchTerm(term: string): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      const updatedHistory = [term, ...history.filter(h => h !== term)].slice(0, 10);
      await this.storeSearchHistory(updatedHistory);
    } catch (error) {
      console.error('Failed to add search term:', error);
    }
  }

  /**
   * Clear search history
   */
  async clearSearchHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }

  /**
   * Store onboarding status
   */
  async storeOnboardingStatus(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ONBOARDING_STATUS,
        JSON.stringify({ completed, timestamp: Date.now() })
      );
    } catch (error) {
      console.error('Failed to store onboarding status:', error);
    }
  }

  /**
   * Get onboarding status
   */
  async getOnboardingStatus(): Promise<{ completed: boolean; timestamp: number } | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_STATUS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get onboarding status:', error);
      return null;
    }
  }

  /**
   * Store generic data with key
   */
  async storeData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to store data for key ${key}:`, error);
    }
  }

  /**
   * Get generic data by key
   */
  async getData(key: string): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Failed to get data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove data by key
   */
  async removeData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove data for key ${key}:`, error);
    }
  }

  /**
   * Clear all app data (useful for logout or reset)
   */
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
      await this.clearTokens();
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  /**
   * Get storage info (for debugging)
   */
  async getStorageInfo(): Promise<{
    keys: string[];
    size: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return { keys, size: totalSize };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { keys: [], size: 0 };
    }
  }
}

export const storageService = new StorageService();

