// src/app/services/review.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private headers() {
    const token = localStorage.getItem('auth_token');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  // ── Check if client can review a freelancer ──────────────
  canReview(freelancerId: string): Observable<any> {
    return this.http.get(
      `${this.base}/reviews/can-review/${freelancerId}`,
      this.headers()
    );
  }

  // ── Submit a review ──────────────────────────────────────
  submitReview(data: {
    freelancer_id: string;
    rating:        number;
    comment:       string;
  }): Observable<any> {
    return this.http.post(
      `${this.base}/reviews`,
      data,
      this.headers()
    );
  }

  // ── Get all reviews for a freelancer (public) ────────────
  getFreelancerReviews(freelancerId: string): Observable<any> {
    return this.http.get(
      `${this.base}/reviews/freelancer/${freelancerId}`
    );
  }

  // ── Freelancer replies to a review ───────────────────────
  replyToReview(reviewId: string, reply: string): Observable<any> {
    return this.http.patch(
      `${this.base}/reviews/${reviewId}/reply`,
      { reply },
      this.headers()
    );
  }

  // ── Admin hides a review ─────────────────────────────────
  hideReview(reviewId: string): Observable<any> {
    return this.http.patch(
      `${this.base}/reviews/${reviewId}/hide`,
      {},
      this.headers()
    );
  }
}