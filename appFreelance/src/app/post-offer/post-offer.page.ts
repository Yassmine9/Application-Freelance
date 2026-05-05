import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonInput, IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { ApiService } from '../services/api.service';
import { CategoryService } from '../services/category.service';
import { FreelanceAuthHelper } from '../services/freelance-auth-helper.service';
import { ToolBarComponent } from '../components/Tool-bar/toolbar.component';

@Component({
  selector: 'app-post-offer',
  templateUrl: './post-offer.page.html',
  styleUrls: ['./post-offer.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonInput, IonSpinner,
    ToolBarComponent
  ]
})
export class PostOfferPage implements OnInit {
  isSubmitting = false;
  newOffer = { title: '', budget: null as number | null, deadline: '', category: '' };
  cahierChargeFile: File | null = null;
  categories: string[] = [];

  constructor(
    private api: ApiService,
    private categoryService: CategoryService,
    private auth: FreelanceAuthHelper,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    if (!this.auth.isClient()) {
      this.router.navigateByUrl('/offers');
      return;
    }

    // Load categories dynamically from backend
    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats.map(c => c.name || c.title || c.key).filter(Boolean);
      },
      error: () => {
        // Fallback categories if backend fails
        this.categories = ['Design', 'Marketing', 'Development', 'Writing', 'Accounting'];
      }
    });
  }

  onCahierChargeSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.cahierChargeFile = input.files && input.files.length ? input.files[0] : null;
  }

  async createOffer() {
    if (!this.newOffer.title?.trim() || !this.newOffer.budget || !this.cahierChargeFile) {
      return this.toast('Please fill all required fields', 'warning');
    }

    const payload = new FormData();
    payload.append('title', this.newOffer.title.trim());
    payload.append('budget', String(this.newOffer.budget));
    if (this.newOffer.deadline) payload.append('deadline', this.newOffer.deadline);
    if (this.newOffer.category) payload.append('category', this.newOffer.category);
    payload.append('cahier_charge', this.cahierChargeFile);

    this.isSubmitting = true;
    this.api.createOffer(payload).subscribe({
      next: async () => {
        this.isSubmitting = false;
        this.newOffer = { title: '', budget: null, deadline: '', category: '' };
        this.cahierChargeFile = null;
        await this.toast('Offer posted!', 'success');
        this.router.navigateByUrl('/my-offers');
      },
      error: async (err) => {
        this.isSubmitting = false;
        await this.toast(err?.error?.error || 'Failed to create offer', 'danger');
      }
    });
  }

  private async toast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, duration: 2200, color, position: 'top' });
    await t.present();
  }
}
