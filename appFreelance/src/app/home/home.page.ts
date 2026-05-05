import { Component } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PreferencesService } from '../services/preferences.service';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
interface HomeFeature {
  title: string;
  icon: string;
}

interface Homefreelancers {
  id: string;
  name: string;
  icon: string;
  avatarImage: string;
  category: string;
}

interface freelancersApiItem {
  _id: string;
  name?: string;
  skills?: string[];
  avatar_filename?: string;
}

type FreelancersApiResponse = FreelancerApiItem[] | { freelancers?: FreelancerApiItem[] };

interface CategoryApiItem {
  _id: string;
  name?: string;
  type?: string;
}

type CategoriesApiResponse = CategoryApiItem[];

interface GigApiItem {
  _id: string;
  title?: string;
  description?: string;
  tags?: string[] | string;
  freelancer_name?: string;
  freelancer_id?: string;
  price?: number;
  image_filename?: string;
}

type GigsApiResponse = GigApiItem[];

interface HomeService {
  id: string;
  title: string;
  icon: string;
  description: string;
  provider: string;
  profession: string;
  rating: number;
  coverImage: string;
  avatarImage: string;
}

type SearchScope = 'all' | 'freelancers' | 'services';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})

export class HomePage {
  searchTerm = '';
  searchScope: SearchScope = 'all';
  private preferredCategories: string[] = [];
  private readonly apiRoot = environment.apiUrl.replace(/\/api\/?$/, '');

  allFeatures: HomeFeature[] = [];
  allFreelancers: HomeFreelancer[] = [];
  allServices: HomeService[] = [];

  // Loading states for smooth UX
  isLoadingFeatures = true;
  isLoadingFreelancers = true;
  isLoadingServices = true;
  userName = '';  
  constructor(
    private readonly router: Router,
    private readonly actionSheetController: ActionSheetController,
    private readonly preferencesService: PreferencesService,
    private readonly http: HttpClient,
    private readonly authService: AuthService, 
  ) {}

  ionViewWillEnter(): void {
    if (!this.preferencesService.hasPreferences()) {
      this.router.navigateByUrl('/preferences', { replaceUrl: true });
      return;
    }
    this.userName = this.authService.getStoredUser()?.name ?? ''; 
    this.preferredCategories = this.preferencesService.getPreferences().categories;
    this.userName = this.authService.getStoredUser()?.name ?? '';
    this.loadFeatures();
    this.loadFreelancers();
    this.loadServices();
  }

  private loadFeatures(): void {
    this.isLoadingFeatures = true;
    this.http.get<CategoriesApiResponse>(`${this.apiRoot}/categories/`).subscribe({
      next: (response) => {
        const categories = (response ?? [])
          .map((category) => (category.name || '').trim())
          .filter((name) => !!name);

        this.allFeatures = this.mapFeaturesFromNames(categories);
        this.isLoadingFeatures = false;
      },
      error: () => {
        this.allFeatures = [];
        this.isLoadingFeatures = false;
      },
    });
  }

  private loadFreelancers(): void {
    this.isLoadingFreelancers = true;
    this.http.get<FreelancersApiResponse>(`${environment.apiUrl}/auth/freelancers?status=all`).subscribe({
      next: (response) => {
        this.allFreelancers = this.mapFreelancersFromApi(response);
        this.isLoadingFreelancers = false;
      },
      error: () => {
        this.http.get<FreelancersApiResponse>(`${environment.apiUrl}/auth/freelancers?status=approved`).subscribe({
          next: (response) => {
            this.allFreelancers = this.mapFreelancersFromApi(response);
            this.isLoadingFreelancers = false;
          },
          error: () => {
            this.allFreelancers = [];
            this.isLoadingFreelancers = false;
          },
        });
      },
    });
  }

  private loadServices(): void {
    this.isLoadingServices = true;
    this.http.get<GigsApiResponse>(`${environment.apiUrl}/gigs`).subscribe({
      next: (response) => {
        this.allServices = (response ?? [])
          .map((gig) => this.mapServiceFromGig(gig))
          .filter((service): service is HomeService => service !== null);

        if (this.allFeatures.length === 0) {
          const extractedCategories = this.allServices.map((service) => service.profession);
          this.allFeatures = this.mapFeaturesFromNames(extractedCategories);
        }
        this.isLoadingServices = false;
      },
      error: () => {
        this.allServices = [];
        this.isLoadingServices = false;
      },
    });
  }

  private mapFeaturesFromNames(names: string[]): HomeFeature[] {
    const seen = new Set<string>();
    const normalized = names
      .map((name) => name.trim())
      .filter((name) => {
        const key = name.toLowerCase();
        if (!key || seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      })
      .slice(0, 9);

    if (normalized.length === 0) {
      return [
        { title: 'Web Development', icon: 'code-slash-outline' },
        { title: 'Mobile Development', icon: 'phone-portrait-outline' },
        { title: 'UI / UX Design', icon: 'color-palette-outline' },
      ];
    }

    return normalized.map((title) => ({
      title,
      icon: this.iconForCategory(title),
    }));
  }

  private mapFreelancersFromApi(response: FreelancersApiResponse): HomeFreelancer[] {
    const rawFreelancers = Array.isArray(response) ? response : (response.freelancers ?? []);

    return rawFreelancers
      .map((freelancer) => this.mapFreelancerFromApi(freelancer))
      .filter((freelancer): freelancer is HomeFreelancer => freelancer !== null);
  }

  private mapFreelancerFromApi(freelancer: FreelancerApiItem): HomeFreelancer | null {
    const name = freelancer.name?.trim();

    if (!name) {
      return null;
    }

    const category = freelancers.skills?.[0]?.trim() || 'freelancers';

    return {
      id: freelancers._id,
      name,
      category,
      icon: this.iconForCategory(category),
      avatarImage: freelancer.avatar_filename
        ? `${environment.apiUrl}/uploads/avatars/${freelancer.avatar_filename}`
        : this.avatarForName(name),
    };
  }

  private mapServiceFromGig(gig: GigApiItem): HomeService | null {
    const title = gig.title?.trim();
    if (!title || !gig._id) {
      return null;
    }

    const firstTag = Array.isArray(gig.tags)
      ? (gig.tags[0] || '').toString().trim()
      : (gig.tags || '').toString().trim();

    const category = firstTag || 'Service';
    const provider = (gig.freelancer_name || 'Freelancer').trim();
    const profession = firstTag || 'Freelance service';
    const price = Number(gig.price || 0);
    const rating = Number((price > 0 ? Math.min(5, Math.max(4, 4 + (price % 10) / 10)) : 4.5).toFixed(1));

    return {
      id: gig._id,
      title,
      icon: this.iconForCategory(category),
      description: gig.description?.trim() || 'Service available now.',
      provider,
      profession,
      rating,
      coverImage: this.coverForCategory(category),
      avatarImage: this.avatarForName(provider),
    };
  }

  private coverForCategory(category: string): string {
    const label = category.toLowerCase();

    if (label.includes('design')) return 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?auto=format&fit=crop&w=900&q=80';
    if (label.includes('market')) return 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=900&q=80';
    if (label.includes('web') || label.includes('dev')) return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80';
    if (label.includes('video')) return 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=80';
    if (label.includes('content') || label.includes('writing')) return 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80';

    return 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80';
  }

  private iconForCategory(category: string): string {
    const label = category.toLowerCase();

    if (label.includes('design')) return 'color-palette-outline';
    if (label.includes('market')) return 'megaphone-outline';
    if (label.includes('web') || label.includes('dev')) return 'code-slash-outline';
    if (label.includes('video')) return 'film-outline';
    if (label.includes('content') || label.includes('writing')) return 'create-outline';
    if (label.includes('ui') || label.includes('ux')) return 'phone-portrait-outline';
    if (label.includes('data')) return 'document-text-outline';

    return 'person-outline';
  }

  private avatarForName(name: string): string {
    const parts = name.split(' ').filter(Boolean);
    const initials = parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('') || 'FR';

    return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=977dff&color=ffffff&fontSize=35&fontWeight=700`;
  }

  get features(): HomeFeature[] {
    return this.prioritizeByPreferences(this.allFeatures, (feature) => feature.title);
  }

  get metrics(): { talents: number; services: number; rating: number } {
    const ratings = this.allServices.map((service) => service.rating).filter((rating) => Number.isFinite(rating));
    const averageRating = ratings.length
      ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
      : 0;

    return {
      talents: this.allFreelancers.length,
      services: this.allServices.length,
      rating: Number(averageRating.toFixed(1)),
    };
  }

  get searchPlaceholder(): string {
    switch (this.searchScope) {
      case 'freelancers':
        return 'Search freelancers by name or skill';
      case 'services':
        return 'Search services by title or description';
      default:
        return 'Search freelancers, services, or projects';
    }
  }

  get filteredfreelancers(): Homefreelancers[] {
    const term = this.searchTerm.trim().toLowerCase();
    const personalized = this.prioritizeByPreferences(this.allfreelancers, (freelancers) => freelancers.category);

    return personalized.filter((freelancers) => {
      if (this.searchScope !== 'all' && this.searchScope !== 'freelancers') {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        freelancers.name.toLowerCase().includes(term) ||
        freelancers.icon.toLowerCase().includes(term) ||
        freelancers.category.toLowerCase().includes(term)
      );
    });
  }

  get filteredServices(): HomeService[] {
    const term = this.searchTerm.trim().toLowerCase();
    const personalized = this.prioritizeByPreferences(this.allServices, (service) => service.profession || service.title);

    return personalized.filter((service) => {
      if (this.searchScope !== 'all' && this.searchScope !== 'services') {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        service.title.toLowerCase().includes(term) ||
        service.description.toLowerCase().includes(term) ||
        service.provider.toLowerCase().includes(term) ||
        service.profession.toLowerCase().includes(term) ||
        service.icon.toLowerCase().includes(term)
      );
    });
  }

  private prioritizeByPreferences<T>(items: T[], getCategory: (item: T) => string): T[] {
    if (this.preferredCategories.length === 0) {
      return [...items];
    }

    const selectedSet = new Set(this.preferredCategories);
    const selectedItems: T[] = [];
    const remainingItems: T[] = [];

    for (const item of items) {
      if (selectedSet.has(getCategory(item))) {
        selectedItems.push(item);
      } else {
        remainingItems.push(item);
      }
    }

    return [...selectedItems, ...remainingItems];
  }

  get showfreelancersSection(): boolean {
    return this.searchScope !== 'services';
  }

  navigateToFreelancerProfile(freelancerId: string): void {
    this.router.navigateByUrl(`/view-freelancer-profile/${freelancerId}`);
  }

  navigateToService(serviceId: string): void {
    if (!serviceId) {
      this.router.navigateByUrl('/gigs');
      return;
    }

    this.router.navigateByUrl(`/gig-detail/${serviceId}`);
  }

  get showServicesSection(): boolean {
    return this.searchScope !== 'freelancers';
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }

  goToRegister(): void {
    this.router.navigateByUrl('/register');
  }

  trackByIndex(index: number): number {
    return index;
  }

  onSearchTermChange(event: Event): void {
    const target = event.target as HTMLIonSearchbarElement | null;
    this.searchTerm = target?.value?.toString() ?? '';
  }

  async openSearchScopePicker(): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: 'Search in',
      buttons: [
        {
          text: 'All',
          handler: () => {
            this.searchScope = 'all';
          },
        },
        {
          text: 'freelancers',
          handler: () => {
            this.searchScope = 'freelancers';
          },
        },
        {
          text: 'Services',
          handler: () => {
            this.searchScope = 'services';
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

}
