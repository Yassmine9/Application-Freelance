import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const API_URL = 'http://localhost:5000';

@Component({
  selector: 'app-admin-reviews',
  templateUrl: './admin-reviews.page.html',
  styleUrls: ['./admin-reviews.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AdminReviewsPage implements OnInit {

  reviews: any[] = [];
  loading = true;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() { this.loadReviews(); }

  loadReviews() {
    this.loading = true;
    this.http.get<any[]>(`${API_URL}/admin/reviews`).subscribe({
      next:  (data) => { this.reviews = data; this.loading = false; },
      error: ()     => { this.reviews = []; this.loading = false; }
    });
  }

  deleteReview(rv: any) {
    rv._processing = 'delete';
    this.http.delete(`${API_URL}/admin/reviews/${rv._id}`).subscribe({
      next:  () => { this.reviews = this.reviews.filter(r => r._id !== rv._id); },
      error: () => { rv._processing = null; }
    });
  }

  renderStars(rating: number): string[] {
    return Array(5).fill('').map((_, i) => i < rating ? 'star' : 'star-outline');
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  doRefresh(event: any) {
    this.loadReviews();
    setTimeout(() => event.target.complete(), 1000);
  }

  goBack() { this.router.navigate(['/admin']); }
}