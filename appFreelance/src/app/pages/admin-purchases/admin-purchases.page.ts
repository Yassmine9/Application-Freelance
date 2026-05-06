import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const API_URL = 'http://localhost:5000';

@Component({
  selector: 'app-admin-purchases',
  templateUrl: './admin-purchases.page.html',
  styleUrls: ['./admin-purchases.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class AdminPurchasesPage implements OnInit {

  purchases: any[] = [];
  filteredPurchases: any[] = [];

  loading = true;
  search = '';
  openedPurchase: string | null = null;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadPurchases();
  }

  loadPurchases(event?: any) {
    this.loading = true;

    this.http.get<any[]>(`${API_URL}/admin/purchases`).subscribe({
      next: (data) => {
        this.purchases = data || [];
        this.applyFilters();
        this.loading = false;

        if (event) event.target.complete();
      },
      error: () => {
        this.purchases = [];
        this.filteredPurchases = [];
        this.loading = false;

        if (event) event.target.complete();
      }
    });
  }

  onSearch() {
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.purchases];

    if (this.search.trim()) {
      const keyword = this.search.toLowerCase();

      result = result.filter(p =>
        (p.buyerId || '').toLowerCase().includes(keyword) ||
        (p.productId || '').toString().toLowerCase().includes(keyword) ||
        (p._id || '').toLowerCase().includes(keyword)
      );
    }

    this.filteredPurchases = result;
  }

  togglePurchase(id: string) {
    this.openedPurchase =
      this.openedPurchase === id ? null : id;
  }

  doRefresh(event: any) {
    this.loadPurchases(event);
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}