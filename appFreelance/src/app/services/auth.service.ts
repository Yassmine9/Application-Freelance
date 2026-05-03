import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { SocketService } from './socket.service';

export interface AuthResponse {
  token: string;
  user: any;
  status: string;
}

export interface RegisterResponse {
  message: string;
  status: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  private currentUser$ = new BehaviorSubject<any>(this.getStoredUser());

  constructor(
    private http: HttpClient,
    private socketService: SocketService
  ) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res.user));
        localStorage.setItem('role', res.user?.role || '');
        localStorage.setItem('userId', res.user?._id || res.user?.id || '');
        this.currentUser$.next(res.user);
      })
    );
  }

  registerClient(data: {
    email: string;
    password: string;
    name: string;
    company_name?: string;
    phone?: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, {
      ...data,
      role: 'client'
    });
  }

  registerfreelancers(data: {
    email: string;
    password: string;
    name: string;
    skills?: string[];
    hourly_rate?: number;
    bio?: string;
    phone?: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, {
      ...data,
      role: 'freelancers'
    });
  }

  getProfile(): Observable<{ user: any }> {
    return this.http.get<{ user: any }>(`${this.apiUrl}/auth/profile`, {
      headers: this.getAuthHeaders()
    });
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getStoredUser(): any {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }

  getCurrentUser(): Observable<any> {
    return this.currentUser$.asObservable();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const user = this.getStoredUser();
    return user?.role || localStorage.getItem('role') || null;
  }

  getUserId(): string {
    const user = this.getStoredUser();
    return user?._id || user?.id || localStorage.getItem('userId') || '';
  }

  isfreelancers(): boolean {
    return this.getUserRole() === 'freelancer';
  }

  isClient(): boolean {
    return this.getUserRole() === 'client';
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    this.currentUser$.next(null);
    this.socketService.disconnect();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
