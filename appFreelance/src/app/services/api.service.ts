// api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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

  constructor(private http: HttpClient) {} // FreelanceAuthHelper removed

  private isCacheValid(cache: CacheEntry | null): boolean {
    return !!cache && Date.now() - cache.timestamp < this.CACHE_TTL;
  }

  getOffers(status?: string, clientId?: string, category?: string): Observable<any[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (clientId) params = params.set('clientId', clientId);
    if (category && category !== 'All') params = params.set('category', category);
    return this.http.get<any[]>(`${this.base}/offers/`, { params });
  }

  getOffer(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/offers/${id}`);
  }

  createOffer(data: FormData): Observable<any> {
    this.myOffersCache = null;
    return this.http.post<any>(`${this.base}/offers/`, data);
  }

  updateOffer(id: string, data: any): Observable<any> {
    this.myOffersCache = null;
    return this.http.put<any>(`${this.base}/offers/${id}`, data);
  }

  deleteOffer(id: string): Observable<any> {
    this.myOffersCache = null;
    return this.http.delete<any>(`${this.base}/offers/${id}`);
  }

  getMyOffers(): Observable<any[]> {
    if (this.isCacheValid(this.myOffersCache)) return of(this.myOffersCache!.data);
    return this.http.get<any[]>(`${this.base}/offers/my/offers`).pipe(
      tap(data => { this.myOffersCache = { data, timestamp: Date.now() }; })
    );
  }

  getOffersByFreelancer(freelancerId: string, proposalStatus?: string): Observable<any[]> {
    let params = new HttpParams();
    if (proposalStatus) params = params.set('proposalStatus', proposalStatus);
    return this.http.get<any[]>(`${this.base}/offers/by-freelancer/${freelancerId}`, { params });
  }

  getMyJobs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/offers/my/jobs`);
  }

  getProposals(offerId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/proposals/${offerId}`);
  }

  submitProposal(data: FormData): Observable<any> {
    this.myProposalsCache = null;
    return this.http.post<any>(`${this.base}/proposals/`, data);
  }

  acceptProposal(proposalId: string): Observable<any> {
    this.myProposalsCache = null;
    this.myOffersCache = null;
    return this.http.put<any>(`${this.base}/proposals/${proposalId}/accept`, {});
  }

  rejectProposal(proposalId: string): Observable<any> {
    this.myProposalsCache = null;
    return this.http.put<any>(`${this.base}/proposals/${proposalId}/reject`, {});
  }

  getMyProposals(): Observable<any[]> {
    if (this.isCacheValid(this.myProposalsCache)) return of(this.myProposalsCache!.data);
    return this.http.get<any[]>(`${this.base}/proposals/my/proposals`).pipe(
      tap(data => { this.myProposalsCache = { data, timestamp: Date.now() }; })
    );
  }

  getMessages(offerId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/messages/${offerId}`);
  }

  sendMessage(data: { receiverId: string; offerId: string; content: string }): Observable<any> {
    this.conversationsCache = null;
    return this.http.post<any>(`${this.base}/messages/`, data);
  }

  getConversations(): Observable<any[]> {
    if (this.isCacheValid(this.conversationsCache)) return of(this.conversationsCache!.data);
    return this.http.get<any[]>(`${this.base}/messages/conversations`).pipe(
      tap(data => { this.conversationsCache = { data, timestamp: Date.now() }; })
    );
  }

  getUserProfile(userId: string): Observable<any> {
    return this.http.get<any>(`${this.base}/auth/profile/${userId}`)
      .pipe(map(res => res?.user ?? res));
  }

  invalidateAllCaches(): void {
    this.myOffersCache = null;
    this.myProposalsCache = null;
    this.conversationsCache = null;
  }
}