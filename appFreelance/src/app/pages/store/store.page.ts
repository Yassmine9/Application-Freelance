import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const API_URL = 'http://localhost:5000';

@Component({
  selector: 'app-store',
  templateUrl: './store.page.html',
  styleUrls: ['./store.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class StorePage implements OnInit {

  products: any[] = [];
  categories: any[] = [];
  searchQuery: string = '';
  selectedCategory: string | null = null;
  isLoading: boolean = true;

  private searchTimeout: any;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.http.get<any[]>(`${API_URL}/categories`).subscribe({
      next: (data) => this.categories = data,
      error: () => this.categories = []
    });
  }

  loadProducts() {
    this.isLoading = true;
    const params: any = {};
    if (this.searchQuery) params['search'] = this.searchQuery;
    if (this.selectedCategory) params['category'] = this.selectedCategory;

    this.http.get<any[]>(`${API_URL}/products`, { params }).subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: () => {
        this.products = [];
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    // Debounce so we don't hit the API on every keystroke
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadProducts(), 400);
  }

  selectCategory(categoryId: string | null) {
    this.selectedCategory = categoryId;
    this.loadProducts();
  }

  goToProduct(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  doRefresh(event: any) {
    this.loadProducts();
    setTimeout(() => event.target.complete(), 800);
  }

  goBack() {
  this.router.navigate(['/home']);
}
}