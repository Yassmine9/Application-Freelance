import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  constructor() { }

  /**
   * Store authentication token locally
   */
  async setToken(token: string): Promise<void> {
    try {
      await Preferences.set({
        key: this.TOKEN_KEY,
        value: token
      });
    } catch (error) {
      console.error('Error storing token:', error);
      throw error;
    }
  }

  /**
   * Retrieve authentication token
   */
  async getToken(): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key: this.TOKEN_KEY });
      return value || null;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  /**
   * Store user data locally
   */
  async setUser(user: any): Promise<void> {
    try {
      await Preferences.set({
        key: this.USER_KEY,
        value: JSON.stringify(user)
      });
    } catch (error) {
      console.error('Error storing user:', error);
      throw error;
    }
  }

  /**
   * Retrieve user data
   */
  async getUser(): Promise<any | null> {
    try {
      const { value } = await Preferences.get({ key: this.USER_KEY });
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error retrieving user:', error);
      return null;
    }
  }

  /**
   * Store refresh token
   */
  async setRefreshToken(token: string): Promise<void> {
    try {
      await Preferences.set({
        key: this.REFRESH_TOKEN_KEY,
        value: token
      });
    } catch (error) {
      console.error('Error storing refresh token:', error);
      throw error;
    }
  }

  /**
   * Retrieve refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key: this.REFRESH_TOKEN_KEY });
      return value || null;
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  }

  /**
   * Clear all authentication data
   */
  async clearAuth(): Promise<void> {
    try {
      await Promise.all([
        Preferences.remove({ key: this.TOKEN_KEY }),
        Preferences.remove({ key: this.USER_KEY }),
        Preferences.remove({ key: this.REFRESH_TOKEN_KEY })
      ]);
    } catch (error) {
      console.error('Error clearing auth:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}
