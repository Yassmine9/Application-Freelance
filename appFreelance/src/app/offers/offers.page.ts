import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonSpinner, IonModal, IonInput, IonTextarea, IonRefresher,
  IonRefresherContent, IonList, IonItem, IonLabel, IonBadge, IonSearchbar,
  IonFab, IonFabButton,
  ToastController, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline, addOutline, closeOutline, trashOutline, cashOutline, timeOutline,
  peopleOutline, documentTextOutline, chatbubbleOutline, briefcaseOutline,
  calendarOutline, chevronForwardOutline, pricetagOutline
} from 'ionicons/icons';
import { ApiService } from '../services/api.service';
import { FreelanceAuthHelper } from '../services/freelance-auth-helper.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
    IonIcon, IonSpinner, IonModal, IonInput, IonTextarea, IonRefresher,
    IonRefresherContent, IonList, IonItem, IonLabel, IonBadge, IonSearchbar,
    IonFab, IonFabButton
  ]
})
export class OffersPage implements OnInit {
  offers: any[] = [];
  filteredOffers: any[] = [];
  isLoading = false;
  isSubmitting = false;
  showCreateModal = false;
  isClient = false;
  isFreelancer = false;
  searchQuery = '';
  activeFilter = 'all';
  // Category filtering
  categories: string[] = ['All', 'Design', 'Marketing', 'Development', 'Writing'];
  selectedCategory = 'All';
  showCategoryRow = true;
  // bottom browse tiles
  browseCategories = [
    { key: 'Design', label: 'Design', icon: 'brush' },
    { key: 'Marketing', label: 'Marketing', icon: 'megaphone' },
    { key: 'Development', label: 'Development', icon: 'code' },
    { key: 'Writing', label: 'Writing', icon: 'document-text' },
    { key: 'Accounting', label: 'Accounting', icon: 'calculator' }
  ];

  newOffer = { title: '', description: '', budget: null as number | null, deadline: '', category: '' };

  constructor(
    private api: ApiService,
    private auth: FreelanceAuthHelper,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ addCircleOutline, addOutline, closeOutline, trashOutline, cashOutline, timeOutline, peopleOutline, documentTextOutline, chatbubbleOutline, briefcaseOutline, calendarOutline, chevronForwardOutline, pricetagOutline });
  }

  openCreate() {
    // ensure modal opens even if client flag has issues in auth during testing
    this.showCreateModal = true;
  }

  ngOnInit() {
    this.isClient = this.auth.isClient();
    this.isFreelancer = this.auth.isFreelancer();
    this.loadOffers();
  }

  onSearch(ev: any) {
    // ion-searchbar fires CustomEvent — value is always in detail.value
    this.searchQuery = ev?.detail?.value ?? '';
    this.applyFilter();
  }

  onSearchClear() {
    this.searchQuery = '';
    this.applyFilter();
  }

  loadOffers(event?: any) {
    this.isLoading = true;
    // Always load ALL offers; filtering is done client-side
    this.api.getOffers().subscribe({
      next: (res) => {
        this.offers = res;
        this.applyFilter();
        this.isLoading = false;
        event?.target?.complete();
      },
      error: async () => {
        this.isLoading = false;
        event?.target?.complete();
        await this.toast('Failed to load offers', 'danger');
      }
    });
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.applyFilter();
  }

  filterOffers() { this.applyFilter(); }

  applyFilter() {
    let result = [...this.offers];

    // Status filter
    if (this.activeFilter !== 'all') {
      result = result.filter(o => o.status === this.activeFilter);
    }

    // Search: match title or description
    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(o =>
        (o.title || '').toLowerCase().includes(q) ||
        (o.description || '').toLowerCase().includes(q)
      );
    }

    // Category: match stored field OR fallback to title/description text
    if (this.selectedCategory && this.selectedCategory !== 'All') {
      const cat = this.selectedCategory.toLowerCase();
      result = result.filter(o =>
        (o.category || '').toLowerCase() === cat ||
        (o.title || '').toLowerCase().includes(cat) ||
        (o.description || '').toLowerCase().includes(cat)
      );
    }

    this.filteredOffers = result;
  }

  clearFilters() {
    this.selectedCategory = 'All';
    this.searchQuery = '';
    this.applyFilter(); // just re-filter, no reload needed
  }

  setCategory(cat: string) {
    this.selectedCategory = cat;
    this.applyFilter(); // client-side only, no reload
  }

  getCountByStatus(status: string): number {
    return this.offers.filter(o => o.status === status).length;
  }

  getInitials(clientId: string): string {
    return clientId ? clientId.slice(-2).toUpperCase() : 'CL';
  }

  async createOffer() {
    if (!this.newOffer.title?.trim() || !this.newOffer.description?.trim() || !this.newOffer.budget) {
      return this.toast('Please fill all required fields', 'warning');
    }
    this.isSubmitting = true;
    this.api.createOffer({
      title: this.newOffer.title,
      description: this.newOffer.description,
      budget: this.newOffer.budget,
      deadline: this.newOffer.deadline || undefined,
      category: this.newOffer.category || undefined
    }).subscribe({
      next: async () => {
        this.isSubmitting = false;
        this.showCreateModal = false;
        this.resetForm();
        await this.toast('Offer posted!', 'success');
        this.loadOffers();
      },
      error: async (err) => {
        this.isSubmitting = false;
        await this.toast(err?.error?.error || 'Failed to create offer', 'danger');
      }
    });
  }

  async confirmDelete(offer: any) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Offer',
      message: `Delete "${offer.title}"? This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => this.deleteOffer(offer._id) }
      ]
    });
    await alert.present();
  }

  deleteOffer(id: string) {
    this.api.deleteOffer(id).subscribe({
      next: async () => {
        this.offers = this.offers.filter(o => o._id !== id);
        this.applyFilter();
        await this.toast('Offer deleted', 'success');
      },
      error: async () => this.toast('Failed to delete', 'danger')
    });
  }

  resetForm() { this.newOffer = { title: '', description: '', budget: null, deadline: '', category: '' }; }

  private async toast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, duration: 2200, color, position: 'top' });
    await t.present();
  }
}