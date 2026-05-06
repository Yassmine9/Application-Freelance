import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const API_URL = 'http://localhost:5000';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class AdminUsersPage implements OnInit {
 users: any[] = [];
  filteredUsers: any[] = [];
  loading = true;

  search = '';
  filter: 'all' | 'clients' | 'freelancers' | 'pending' = 'all';

  openedUser: string | null = null;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(event?: any) {
    this.loading = true;

    this.http.get<any[]>(`${API_URL}/admin/freelancers`).subscribe({
      next: (data) => {
        this.users = data || [];
        this.applyFilters(); 
        this.loading = false; 
        event?.target?.complete();
      },
      error: () => {
        this.users = [];
        this.filteredUsers = [];
        this.loading = false;

        event?.target?.complete();
      }
    });
  }

  setFilter(type: any) {
    this.filter = type;
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.users];

    // search
    if (this.search.trim()) {
      const k = this.search.toLowerCase();
      result = result.filter(u =>
        (u.name || '').toLowerCase().includes(k) ||
        (u.email || '').toLowerCase().includes(k)
      );
    }

    // filter
    if (this.filter === 'clients') {
      result = result.filter(u => u.role === 'client');
    }

    if (this.filter === 'freelancers') {
      result = result.filter(u => u.role === 'freelancer');
    }

    if (this.filter === 'pending') {
      result = result.filter(u => u.status === 'pending');
    }

    this.filteredUsers = result;
  }

  toggleUser(id: string) {
    this.openedUser = this.openedUser === id ? null : id;
  }

  approveUser(user: any) {
    user._loading = true;

    this.http.patch(`${API_URL}/admin/approve/${user._id}`, {}).subscribe({
      next: () => {
        user.status = 'approved';
        user._loading = false;
        this.applyFilters();
      },
      error: () => {
        user._loading = false;
        alert('Approve failed');
      }
    });
  }

  rejectUser(user: any) {
    user._loading = true;

    this.http.patch(`${API_URL}/admin/reject/${user._id}`, {}).subscribe({
      next: () => {
        user.status = 'rejected';
        user._loading = false;
        this.applyFilters();
      },
      error: () => {
        user._loading = false;
        alert('Reject failed');
      }
    });
  }

  doRefresh(event: any) {
    this.loadUsers(event);
  }

  goBack() {
    this.router.navigate(['/admin']);
  }

}
