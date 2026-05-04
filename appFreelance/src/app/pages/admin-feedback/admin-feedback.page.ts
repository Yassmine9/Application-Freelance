import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const API_URL = 'http://localhost:5000';

@Component({
  selector: 'app-admin-feedback',
  templateUrl: './admin-feedback.page.html',
  styleUrls: ['./admin-feedback.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AdminFeedbackPage implements OnInit {

  feedbacks: any[] = [];
  loading = true;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() { this.loadFeedback(); }

  loadFeedback() {
    this.loading = true;
    this.http.get<any[]>(`${API_URL}/admin/feedback`).subscribe({
      next:  (data) => { this.feedbacks = data; this.loading = false; },
      error: ()     => { this.feedbacks = []; this.loading = false; }
    });
  }

  deleteFeedback(fb: any) {
    fb._processing = 'delete';
    this.http.delete(`${API_URL}/admin/feedback/${fb._id}`).subscribe({
      next:  () => { this.feedbacks = this.feedbacks.filter(f => f._id !== fb._id); },
      error: () => { fb._processing = null; }
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  doRefresh(event: any) {
    this.loadFeedback();
    setTimeout(() => event.target.complete(), 1000);
  }

  goBack() { this.router.navigate(['/admin']); }
}