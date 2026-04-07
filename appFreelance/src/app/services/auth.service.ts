import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole, UserStatus, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;

  private userRoleSubject: BehaviorSubject<UserRole | null>;
  public userRole$: Observable<UserRole | null>;

  constructor(private storageService: StorageService) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();

    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    this.userRoleSubject = new BehaviorSubject<UserRole | null>(null);
    this.userRole$ = this.userRoleSubject.asObservable();

    this.initializeAuth();
  }

  /**
   * Initialize authentication from stored data
   */
  private async initializeAuth(): Promise<void> {
    try {
      const user = await this.storageService.getUser();
      const isAuth = await this.storageService.isAuthenticated();

      if (user && isAuth) {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        this.userRoleSubject.next(user.role);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  /**
   * Login user
   * In production, this would call a real API
   */
  async login(credentials: LoginRequest): Promise<AuthResponse | null> {
    try {
      // Simulate API call
      const mockResponse: AuthResponse = {
        token: 'mock_token_' + Math.random().toString(36).substr(2, 9),
        user: {
          id: '123',
          email: credentials.email,
          firstName: 'John',
          lastName: 'Doe',
          role: this.extractRoleFromEmail(credentials.email),
          status: UserStatus.ACTIVE,
          avatar: 'https://via.placeholder.com/150',
          bio: 'Professional Freelancer',
          phoneNumber: '+1234567890',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      // Store token and user
      await this.storageService.setToken(mockResponse.token);
      await this.storageService.setUser(mockResponse.user);

      // Update BehaviorSubjects
      this.currentUserSubject.next(mockResponse.user);
      this.isAuthenticatedSubject.next(true);
      this.userRoleSubject.next(mockResponse.user.role);

      return mockResponse;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   * In production, this would call a real API
   */
  async register(data: RegisterRequest): Promise<AuthResponse | null> {
    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Simulate API call
      const mockResponse: AuthResponse = {
        token: 'mock_token_' + Math.random().toString(36).substr(2, 9),
        user: {
          id: Date.now().toString(),
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          status: UserStatus.PENDING,
          avatar: 'https://via.placeholder.com/150',
          bio: '',
          phoneNumber: '',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      // Store token and user
      await this.storageService.setToken(mockResponse.token);
      await this.storageService.setUser(mockResponse.user);

      // Update BehaviorSubjects
      this.currentUserSubject.next(mockResponse.user);
      this.isAuthenticatedSubject.next(true);
      this.userRoleSubject.next(mockResponse.user.role);

      return mockResponse;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.storageService.clearAuth();
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      this.userRoleSubject.next(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get current user role
   */
  getUserRole(): UserRole | null {
    return this.userRoleSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    return this.userRoleSubject.value === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const currentRole = this.userRoleSubject.value;
    return currentRole ? roles.includes(currentRole) : false;
  }

  /**
   * Get stored token
   */
  async getStoredToken(): Promise<string | null> {
    return this.storageService.getToken();
  }

  /**
   * Mock role extraction from email for demo purposes
   */
  private extractRoleFromEmail(email: string): UserRole {
    if (email.includes('admin')) {
      return UserRole.ADMIN;
    } else if (email.includes('freelancer')) {
      return UserRole.FREELANCER;
    }
    return UserRole.CLIENT;
  }
}
