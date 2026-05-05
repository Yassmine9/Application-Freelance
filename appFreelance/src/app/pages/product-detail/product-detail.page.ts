import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FreelanceAuthHelper } from '../../services/freelance-auth-helper.service';

const API_URL = environment.apiUrl.replace(/\/api\/?$/, '');

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ProductDetailPage implements OnInit {

  product: any = null;
  isLoading   = true;
  isPurchasing = false;
  isPurchased  = false;
  downloadLink: string | null = null;

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private http:   HttpClient,
    private auth: FreelanceAuthHelper
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadProduct(id);
  }

  loadProduct(id: string) {
    this.isLoading = true;
    this.http.get<any>(`${API_URL}/products/${id}`).subscribe({
      next:  (data) => { this.product = data; this.isLoading = false; },
      error: ()     => { this.product = null;  this.isLoading = false; }
    });
  }

  purchase() {
    if (!this.product || this.isPurchasing || this.isPurchased) return;

    this.isPurchasing = true;

    this.http.post<any>(`${API_URL}/products/purchase`, {
      productId: this.product._id,
      buyerId: this.auth.getUserId() || 'anonymous-buyer'
    }).subscribe({
      next: (res) => {
        this.isPurchasing = false;
        this.isPurchased  = true;
        this.downloadLink = res.download_link;
      },
      error: () => {
        this.isPurchasing = false;
      }
    });
  }

  openDownload() {
    if (this.downloadLink) window.open(this.downloadLink, '_blank');
  }

  shareProduct() {
    if (navigator.share && this.product) {
      navigator.share({ title: this.product.title, text: this.product.description });
    }
  }

  goBack() {
    this.router.navigate(['/store']);
  }

  doRefresh(event: any) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadProduct(id);
    setTimeout(() => event.target.complete(), 800);
  }
}