import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonSpinner, IonModal, IonInput, IonRefresher,
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
import { CategoryService } from '../services/category.service';
import { FreelanceAuthHelper } from '../services/freelance-auth-helper.service';
import { ToolBarComponent } from '../components/Tool-bar/toolbar.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
    IonIcon, IonSpinner, IonModal, IonInput, IonRefresher,
    IonRefresherContent, IonList, IonItem, IonLabel, IonBadge, IonSearchbar,
    IonFab, IonFabButton,
    ToolBarComponent
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
  apiUrl = environment.apiUrl.replace(/\/api\/?$/, '');
  
  // Category filtering
  categories: string[] = ['All'];
  selectedCategory = 'All';
  showCategoryRow = true;
  browseCategories: any[] = [];

  newOffer = { title: '', budget: null as number | null, deadline: '', category: '' };
  cahierChargeFile: File | null = null;

  constructor(
    private api: ApiService,
    private categoryService: CategoryService,
    private auth: FreelanceAuthHelper,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ addCircleOutline, addOutline, closeOutline, trashOutline, cashOutline, timeOutline, peopleOutline, documentTextOutline, chatbubbleOutline, briefcaseOutline, calendarOutline, chevronForwardOutline, pricetagOutline });
  }

  openCreate() {
    this.showCreateModal = true;
  }

  ngOnInit() {
    this.isClient = this.auth.isClient();
    this.isFreelancer = this.auth.isFreelancer();
    
    // Load categories dynamically from backend
    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        const categoryNames = cats.map(c => c.name || c.title || c.key).filter(Boolean);
        this.categories = ['All', ...categoryNames];
        this.browseCategories = categoryNames.map((cat, idx) => ({
          key: cat,
          label: cat,
          icon: ['brush', 'megaphone', 'code', 'document-text', 'calculator'][idx % 5]
        }));
      },
      error: () => {
        this.categories = ['All', 'Design', 'Marketing', 'Development', 'Writing', 'Accounting'];
        this.browseCategories = [
          { key: 'Design', label: 'Design', icon: 'brush' },
          { key: 'Marketing', label: 'Marketing', icon: 'megaphone' },
          { key: 'Development', label: 'Development', icon: 'code' },
          { key: 'Writing', label: 'Writing', icon: 'document-text' },
          { key: 'Accounting', label: 'Accounting', icon: 'calculator' }
        ];
      }
    });
    
    this.loadOffers();

    this.route.queryParamMap.subscribe((params) => {
      const openCreate = params.get('create') === '1';
      if (openCreate && this.isClient) {
        this.openCreate();
      }
    });
  }

  onSearch(ev: any) {
    this.searchQuery = ev?.detail?.value ?? '';
    this.applyFilter();
  }

  onSearchClear() {
    this.searchQuery = '';
    this.applyFilter();
  }

 
  loadOffers(event?: any) {
    this.isLoading = true;
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

  applyFilter() {
    let result = [...this.offers];

    // Search: match title
    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(o =>
        (o.title || '').toLowerCase().includes(q)
      );
    }

    // Category filter
    if (this.selectedCategory && this.selectedCategory !== 'All') {
      const cat = this.selectedCategory.toLowerCase();
      result = result.filter(o =>
        (o.category || '').toLowerCase() === cat ||
        (o.title || '').toLowerCase().includes(cat)
      );
    }

    this.filteredOffers = result;
  }

  clearFilters() {
    this.selectedCategory = 'All';
    this.searchQuery = '';
    this.applyFilter();
  }

  setCategory(cat: string) {
    this.selectedCategory = cat;
    this.applyFilter();
  }

  getInitials(clientId: string): string {
    return clientId ? clientId.slice(-2).toUpperCase() : 'CL';
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

  getChatLink(offer: any): any[] {
    if (this.isClient) {
      return ['/chat', offer._id, offer.acceptedFreelancerId || ''];
    }
    return ['/chat', offer._id, offer.clientId || ''];
  }

  resetForm() {
    this.newOffer = { title: '', budget: null, deadline: '', category: '' };
    this.cahierChargeFile = null;
  }

  private async toast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, duration: 2200, color, position: 'top' });
    await t.present();
  }
}