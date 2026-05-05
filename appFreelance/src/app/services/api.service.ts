import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FreelanceAuthHelper } from './freelance-auth-helper.service';

interface CacheEntry {
  data: any[];
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;
  private myOffersCache: CacheEntry | null = null;
  private myProposalsCache: CacheEntry | null = null;
  private conversationsCache: CacheEntry | null = null;
  private readonly CACHE_TTL = 3 * 60 * 1000; 

  constructor(
    private http: HttpClient,
    private auth: FreelanceAuthHelper
  ) {}

  private headers(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private isCacheValid(cacheEntry: CacheEntry | null): boolean {
    if (!cacheEntry) return false;
    const age = Date.now() - cacheEntry.timestamp;
    return age < this.CACHE_TTL;
  }

  // ─── Offers ───────────────────────────────────────────────────────────────

  getOffers(status?: string, clientId?: string, category?: string): Observable<any[]> {
    let params = new HttpParams(); 
    if (status) params = params.set('status', status);
    if (clientId) params = params.set('clientId', clientId);
    if (category && category !== 'All') params = params.set('category', category);
    return this.http.get<any[]>(`${this.base}/offers/`, { headers: this.headers(), params });
  }

  getOffer(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/offers/${id}`, { headers: this.headers() });
  }

  createOffer(data: FormData): Observable<any> {
    this.myOffersCache = null;
    return this.http.post<any>(`${this.base}/offers/`, data, { headers: this.headers() });
  }

  updateOffer(id: string, data: any): Observable<any> {
    this.myOffersCache = null;
    return this.http.put<any>(`${this.base}/offers/${id}`, data, { headers: this.headers() });
  }

  deleteOffer(id: string): Observable<any> {
    this.myOffersCache = null;
    return this.http.delete<any>(`${this.base}/offers/${id}`, { headers: this.headers() });
  }

  /** Client: get my posted offers (all statuses) */
  getMyOffers(): Observable<any[]> {
    if (this.isCacheValid(this.myOffersCache)) {
      return of(this.myOffersCache!.data);
    }
    return this.http.get<any[]>(`${this.base}/offers/my/offers`, { headers: this.headers() }).pipe(
      tap((data) => {
        this.myOffersCache = { data, timestamp: Date.now() };
      })
    );
  }

  getOffersByFreelancer(freelancerId: string, proposalStatus?: string): Observable<any[]> {
    let params = new HttpParams();
    if (proposalStatus) params = params.set('proposalStatus', proposalStatus);
    return this.http.get<any[]>(`${this.base}/offers/by-freelancers/${freelancerId}`, { headers: this.headers(), params });
  }

  /** Freelancer: get my accepted jobs */
  getMyJobs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/offers/my/jobs`, { headers: this.headers() });
  }

  // ─── Proposals ────────────────────────────────────────────────────────────


  getProposals(offerId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/proposals/${offerId}`, { headers: this.headers() });
  }

  submitProposal(data: FormData): Observable<any> {
    this.myProposalsCache = null;
    return this.http.post<any>(`${this.base}/proposals/`, data, { headers: this.headers() });
  }

  acceptProposal(proposalId: string): Observable<any> {
    this.myProposalsCache = null;
    this.myOffersCache = null;
    return this.http.put<any>(`${this.base}/proposals/${proposalId}/accept`, {}, { headers: this.headers() });
  }

  rejectProposal(proposalId: string): Observable<any> {
    this.myProposalsCache = null;
    return this.http.put<any>(`${this.base}/proposals/${proposalId}/reject`, {}, { headers: this.headers() });
  }

  getMyProposals(): Observable<any[]> {
    if (this.isCacheValid(this.myProposalsCache)) {
      return of(this.myProposalsCache!.data);
    }
    return this.http.get<any[]>(`${this.base}/proposals/my/proposals`, { headers: this.headers() }).pipe(
      tap((data) => {
        this.myProposalsCache = { data, timestamp: Date.now() };
      })
    );
  }

  // ─── Messages ─────────────────────────────────────────────────────────────

  getMessages(offerId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/messages/${offerId}`, { headers: this.headers() });
  }

  sendMessage(data: { receiverId: string; offerId: string; content: string }): Observable<any> {
    this.conversationsCache = null;
    return this.http.post<any>(`${this.base}/messages/`, data, { headers: this.headers() });
  }

  getConversations(): Observable<any[]> {
    if (this.isCacheValid(this.conversationsCache)) {
      return of(this.conversationsCache!.data);
    }
    return this.http.get<any[]>(`${this.base}/messages/conversations`, { headers: this.headers() }).pipe(
      tap((data) => {
        this.conversationsCache = { data, timestamp: Date.now() };
      })
    );
  }

  // ─── Users / Profiles ─────────────────────────────────────────────────────

  getUserProfile(userId: string): Observable<any> {
    return this.http
      .get<any>(`${this.base}/auth/profile/${userId}`, { headers: this.headers() })
      .pipe(map((response) => response?.user ?? response));
  }

  // ─── Cache invalidation ───────────────────────────────────────────────────

  invalidateAllCaches(): void {
    this.myOffersCache = null;
    this.myProposalsCache = null;
    this.conversationsCache = null;
  }
}
