import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { CheckoutComponent } from '../../modals/checkout/checkout.component';

const API_URL = 'http://localhost:5000';

// Replace with real auth later — hardcoded for simulation
const MOCK_BUYER_ID = 'buyer_001';

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
  downloadLink: any | null = null;

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private http:   HttpClient,
    private modalCtrl: ModalController
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

 async purchase() {
  if (!this.product || this.isPurchased) return;

  const modal = await this.modalCtrl.create({
    component: CheckoutComponent,
    componentProps: {
      product: this.product
    }
  });

  await modal.present();

  const { data } = await modal.onDidDismiss();

  // user cancelled
  if (!data || !data.success) return;

  // payment succeeded → now call backend purchase
  this.isPurchasing = true;

  this.http.post<any>(`${API_URL}/products/purchase`, {
    productId: this.product._id,
    buyerId: MOCK_BUYER_ID
  }).subscribe({
    next: (res) => {
      this.isPurchasing = false;
      this.isPurchased = true;
      this.downloadLink = res.download_link;
    },
    error: () => {
      this.isPurchasing = false;
    }
  });
}

 openDownload() {
  window.open(this.downloadLink, '_blank');
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