import { Injectable } from '@angular/core';

/**
 * Person C auth helper.
 * Reads token/userId/role from localStorage — set by DevLoginPage.
 * No dependency on Person A's AuthService or StorageService.
 * When merging with Person A, just update getToken() to call their service.
 */
@Injectable({ providedIn: 'root' })
export class FreelanceAuthHelper {

  getToken(): string {
    return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
  }

  getUserId(): string {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        return user?._id || user?.id || '';
      } catch {
        return '';
      }
    }

    return localStorage.getItem('userId') || '';
  }

  getRole(): string {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        return user?.role || '';
      } catch {
        return '';
      }
    }

    return localStorage.getItem('role') || '';
  }

  isClient(): boolean {
    return this.getRole() === 'client';
  }

  isFreelancer(): boolean {
    return this.getRole() === 'freelancer';
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}