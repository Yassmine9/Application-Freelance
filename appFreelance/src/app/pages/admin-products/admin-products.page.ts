import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const API_URL = 'http://localhost:5000';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.page.html',
  styleUrls: ['./admin-products.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class AdminProductsPage implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  categories: any[] = [];

  loading = true;
  search = '';
  selectedCategory = 'all';
  openedProduct: string | null = null;
  

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.http.get<any[]>(`${API_URL}/categories/`).subscribe({
      next: (data) => {
        this.categories = data || [];
      },
      error: () => {
        this.categories = [];
      }
    });
  }

  loadProducts(event?: any) {
    this.loading = true;

    this.http.get<any[]>(`${API_URL}/admin/products`).subscribe({
      next: (data) => {
        this.products = data || [];
        this.applyFilters();

        this.loading = false;

        if (event) {
          event.target.complete();
        }
      },

      error: () => {
        this.products = [];
        this.filteredProducts = [];
        this.loading = false;

        if (event) {
          event.target.complete();
        }
      }
    });
  }

  onSearch() {
    this.applyFilters();
  }

  filterCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.products];

    // search
    if (this.search.trim()) {
      const keyword = this.search.toLowerCase();

      result = result.filter(product =>
        (product.name || product.title || '')
          .toLowerCase()
          .includes(keyword)
      );
    }

    // category
    if (this.selectedCategory !== 'all') {
      result = result.filter(product => {
        const categoryId =
          product.category?._id ||
          product.category?.id ||
          product.category_id ||
          product.category;

        return categoryId === this.selectedCategory;
      });
    }

    this.filteredProducts = result;
  }

  getCategoryName(product: any): string {
    const id =
      product.category?._id ||
      product.category?.id ||
      product.category_id ||
      product.category;

    const found = this.categories.find(
      c => c._id === id || c.id === id
    );

    return found?.name || 'No category';
  }

  toggleProduct(id: string) {
    this.openedProduct =
      this.openedProduct === id ? null : id;
  }

  doRefresh(event: any) {
    this.loadCategories();
    this.loadProducts(event);
  }

  goBack() {
    this.router.navigate(['/admin']);
  }

  deleteProduct(product: any) {
  if (product._deleting) return;

  const confirmed = confirm(
    `Delete "${product.title}" ?`
  );

  if (!confirmed) return;

  product._deleting = true;

  this.http.delete(
    `${API_URL}/products/${product._id}`
  ).subscribe({
    next: () => {
      this.products = this.products.filter(
        p => p._id !== product._id
      );

      this.filteredProducts = this.filteredProducts.filter(
        p => p._id !== product._id
      );

      if (this.openedProduct === product._id) {
        this.openedProduct = null;
      }
    },

    error: () => {
      product._deleting = false;
      alert('Delete failed');
    }
  });
}
}