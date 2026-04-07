import { Component } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PreferencesService } from '../services/preferences.service';
import { environment } from '../../environments/environment';

interface HomeFeature {
  title: string;
  icon: string;
}

interface HomeFreelancer {
  name: string;
  icon: string;
  avatarImage: string;
  category: string;
}

interface FreelancerApiItem {
  _id: string;
  name?: string;
  skills?: string[];
}

interface FreelancersApiResponse {
  freelancers: FreelancerApiItem[];
}

interface HomeService {
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

  readonly allFeatures: HomeFeature[] = [

    {
      title: 'Web Development',
      icon: 'code-slash-outline',
    },

    {
      title: 'UI / UX Design',
      icon: 'phone-portrait-outline',
    },
    {
      title: 'Mobile Development',
      icon: 'phone-portrait-outline',
    },
    {
      title: 'SEO Optimization',
      icon: 'trending-up-outline',
    },

    {
      title: 'Data Entry',
      icon: 'document-text-outline',
    },

    {
      title: '3D Modeling',
      icon: 'cube-outline',
    },
    {
      title: 'Cybersecurity',
      icon: 'shield-checkmark-outline',
    },
    {
      title: 'AI Automation',
      icon: 'sparkles-outline',
    },
  ];
  allFreelancers: HomeFreelancer[] = [];
  readonly allServices: HomeService[] = [
    {
      title: 'Graphic Design',
      icon: 'color-palette-outline',
      description: 'Branding, posters, and visual identities with a clean finish.',
      provider: 'Nour Ben Ali',
      profession: 'Graphic Designer',
      rating: 4.9,
      coverImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
      avatarImage: 'https://api.dicebear.com/9.x/initials/svg?seed=NB&backgroundColor=977dff&color=ffffff&fontSize=35&fontWeight=700',
    },
    {
      title: 'Rim Gharbi',
      icon: 'megaphone-outline',
      description: 'Campaigns, social content, and growth-focused strategy.',
      provider: 'Amira Kacem',
      profession: 'Marketing Specialist',
      rating: 4.8,
      coverImage: 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=900&q=80',
      avatarImage: 'https://api.dicebear.com/9.x/initials/svg?seed=AK&backgroundColor=0600ab&color=ffffff&fontSize=35&fontWeight=700',
    },
    {
      title: 'Hiba Mansouri',
      icon: 'code-slash-outline',
      description: 'Responsive websites and front-end builds that feel fast.',
      provider: 'Sami Trabelsi',
      profession: 'Front-end Developer',
      rating: 4.9,
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
      avatarImage: 'https://api.dicebear.com/9.x/initials/svg?seed=ST&backgroundColor=6b7dff&color=ffffff&fontSize=35&fontWeight=700',
    },
    {
      title: 'Nour Ben Ali',
      icon: 'film-outline',
      description: 'Short-form and promo edits with a polished rhythm.',
      provider: 'Hiba Mansouri',
      profession: 'Video Editor',
      rating: 4.7,
      coverImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=80',
      avatarImage: 'https://api.dicebear.com/9.x/initials/svg?seed=HM&backgroundColor=4f46e5&color=ffffff&fontSize=35&fontWeight=700',
    },
    {
      title: 'Content ',
      icon: 'create-outline',
      description: 'Copy that is concise, persuasive, and easy to trust.',
      provider: 'Rim Gharbi',
      profession: 'Content Writer',
      rating: 4.8,
      coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80',
      avatarImage: 'https://api.dicebear.com/9.x/initials/svg?seed=RG&backgroundColor=7c7dff&color=ffffff&fontSize=35&fontWeight=700',
    },
    {
      title: 'UI / UX Design',
      icon: 'phone-portrait-outline',
      description: 'Product flows and interfaces built for clarity.',
      provider: 'Ines Chatti',
      profession: 'UI/UX Designer',
      rating: 5.0,
      coverImage: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?auto=format&fit=crop&w=900&q=80',
      avatarImage: 'https://api.dicebear.com/9.x/initials/svg?seed=IC&backgroundColor=5555ff&color=ffffff&fontSize=35&fontWeight=700',
    },
  ];
  constructor(
    private readonly router: Router,
    private readonly actionSheetController: ActionSheetController,
    private readonly preferencesService: PreferencesService,
    private readonly http: HttpClient,
  ) {}

  ionViewWillEnter(): void {
    if (!this.preferencesService.hasPreferences()) {
      this.router.navigateByUrl('/preferences', { replaceUrl: true });
      return;
    }

    this.preferredCategories = this.preferencesService.getPreferences().categories;
    this.loadFreelancers();
  }

  private loadFreelancers(): void {
    this.http.get<FreelancersApiResponse>(`${environment.apiUrl}/freelancers`).subscribe({
      next: (response) => {
        const mapped = (response.freelancers ?? [])
          .map((freelancer) => this.mapFreelancerFromApi(freelancer))
          .filter((freelancer): freelancer is HomeFreelancer => freelancer !== null);

        this.allFreelancers = mapped;
      },
      error: () => {
        this.allFreelancers = [];
      },
    });
  }

  private mapFreelancerFromApi(freelancer: FreelancerApiItem): HomeFreelancer | null {
    const name = freelancer.name?.trim();

    if (!name) {
      return null;
    }

    const category = freelancer.skills?.[0]?.trim() || 'Freelancer';

    return {
      name,
      category,
      icon: this.iconForCategory(category),
      avatarImage: this.avatarForName(name),
    };
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

  get filteredFreelancers(): HomeFreelancer[] {
    const term = this.searchTerm.trim().toLowerCase();
    const personalized = this.prioritizeByPreferences(this.allFreelancers, (freelancer) => freelancer.category);

    return personalized.filter((freelancer) => {
      if (this.searchScope !== 'all' && this.searchScope !== 'freelancers') {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        freelancer.name.toLowerCase().includes(term) ||
        freelancer.icon.toLowerCase().includes(term) ||
        freelancer.category.toLowerCase().includes(term)
      );
    });
  }

  get filteredServices(): HomeService[] {
    const term = this.searchTerm.trim().toLowerCase();
    const personalized = this.prioritizeByPreferences(this.allServices, (service) => service.title);

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
        service.profession.toLowerCase().includes(term)
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

  get showFreelancersSection(): boolean {
    return this.searchScope !== 'services';
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
          text: 'Freelancers',
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
