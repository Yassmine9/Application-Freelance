import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const API_URL = 'http://localhost:5000';

@Component({
  selector: 'app-admin-offers',
  templateUrl: './admin-offers.page.html',
  styleUrls: ['./admin-offers.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class AdminOffersPage implements OnInit {

  offers: any[] = [];
  filteredOffers: any[] = [];

  loading = true;
  search = '';
  openedOffer: string | null = null;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadOffers();
  }

  loadOffers(event?: any) {
    this.loading = true;

    this.http.get<any[]>(`${API_URL}/admin/offers`).subscribe({
      next: (data) => {
        this.offers = data || [];
        this.applyFilters();
        this.loading = false;

        if (event) event.target.complete();
      },
      error: () => {
        this.offers = [];
        this.filteredOffers = [];
        this.loading = false;

        if (event) event.target.complete();
      }
    });
  }

  onSearch() {
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.offers];

    if (this.search.trim()) {
      const k = this.search.toLowerCase();

      result = result.filter(o =>
        o.title?.toLowerCase().includes(k) ||
        o.category?.toLowerCase().includes(k) ||
        o.status?.toLowerCase().includes(k)
      );
    }

    this.filteredOffers = result;
  }

  toggleOffer(id: string) {
    this.openedOffer = this.openedOffer === id ? null : id;
  }

  approveOffer(offer: any) {
    this.http.patch(`${API_URL}/admin/offers/${offer._id}/approve`, {}).subscribe({
      next: () => offer.status = 'approved'
    });
  }

  rejectOffer(offer: any) {
    this.http.patch(`${API_URL}/admin/offers/${offer._id}/reject`, {}).subscribe({
      next: () => offer.status = 'rejected'
    });
  }

  doRefresh(event: any) {
    this.loadOffers(event);
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}