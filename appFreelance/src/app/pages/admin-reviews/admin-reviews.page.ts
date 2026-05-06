import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const API_URL = 'http://localhost:5000';

@Component({
  selector: 'app-admin-reviews',
  templateUrl: './admin-reviews.page.html',
  styleUrls: ['./admin-reviews.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class AdminReviewsPage implements OnInit {

  reviews: any[] = [];
  filteredReviews: any[] = [];

  loading = true;
  search = '';
  openedReview: string | null = null;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadReviews();
  }

  loadReviews(event?: any) {
    this.loading = true;

    this.http.get<any[]>(`${API_URL}/admin/reviews`).subscribe({
      next: (data) => {
        this.reviews = data || [];
        this.applyFilters();
        this.loading = false;

        if (event) event.target.complete();
      },
      error: () => {
        this.reviews = [];
        this.filteredReviews = [];
        this.loading = false;

        if (event) event.target.complete();
      }
    });
  }

  onSearch() {
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.reviews];

    if (this.search.trim()) {
      const k = this.search.toLowerCase();

      result = result.filter(r =>
        r.client_name?.toLowerCase().includes(k) ||
        r.comment?.toLowerCase().includes(k) ||
        r.status?.toLowerCase().includes(k)
      );
    }

    this.filteredReviews = result;
  }

  toggleReview(id: string) {
    this.openedReview = this.openedReview === id ? null : id;
  }

  hideReview(review: any) {
    if (review._hiding) return;

    review._hiding = true;

    this.http.patch(`${API_URL}/admin/reviews/${review._id}/hide`, {})
      .subscribe({
        next: () => {
          review.status = 'hidden';
          review._hiding = false;
        },
        error: () => {
          review._hiding = false;
        }
      });
  }

  doRefresh(event: any) {
    this.loadReviews(event);
  }

  goBack() {
    this.router.navigate(['/admin']);
  }

  toggleComment(review: any) {
  review._expandedComment = !review._expandedComment;
}
}