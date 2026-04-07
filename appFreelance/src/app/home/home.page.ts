import { Component } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PreferencesService } from '../services/preferences.service';

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
      title: 'Graphic Design',
      icon: 'color-palette-outline',
    },
    {
      title: 'Digital Marketing',
      icon: 'megaphone-outline',
    },
    {
      title: 'Web Development',
      icon: 'code-slash-outline',
    },
    {
      title: 'Video Editing',
      icon: 'film-outline',
    },
    {
      title: 'Content Writing',
      icon: 'create-outline',
    },
    {
      title: 'UI / UX Design',
      icon: 'phone-portrait-outline',
    },
  ];
  readonly allFreelancers: HomeFreelancer[] = [
    {
      name: 'Yassmine Abdelhak',
      icon: 'color-palette-outline',
      avatarImage: 'https://api.dicebear.com/9.x/initials/svg?seed=YA&backgroundColor=977dff&color=ffffff&fontSize=35&fontWeight=700',
      category: 'Graphic Design',
    },
    {
      name: 'Asma Abdedaiem ',
      icon: 'megaphone-outline',
      avatarImage: 'https://api.dicebear.com/9.x/initials/svg?seed=AA&backgroundColor=0600ab&color=ffffff&fontSize=35&fontWeight=700',
      category: 'Digital Marketing',
    },
    {
      name : 'Sirine Saidi',
      icon: 'code-slash-outline',
      avatarImage: 'https://api.dicebear.com/9.x/initials/svg?seed=SS&backgroundColor=6b7dff&color=ffffff&fontSize=35&fontWeight=700',
      category: 'Web Development',
    },
    {
      name: 'Yasmine Srioui',
      icon: 'film-outline',
      avatarImage: 'https://api.dicebear.com/9.x/initials/svg?seed=YS&backgroundColor=4f46e5&color=ffffff&fontSize=35&fontWeight=700',
      category: 'Video Editing',
    },
    {
      name: 'Amira Kacem',
      icon: 'create-outline',
      avatarImage: 'https://api.dicebear.com/9.x/initials/svg?seed=CW&backgroundColor=7c7dff&color=ffffff&fontSize=35&fontWeight=700',
      category: 'Content Writing',
    },
    {
      name: 'Ines Chatti',
      icon: 'phone-portrait-outline',
      avatarImage: 'https://api.dicebear.com/9.x/initials/svg?seed=UU&backgroundColor=5555ff&color=ffffff&fontSize=35&fontWeight=700',
      category: 'UI / UX Design',
    },
  ];
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
      title: 'Content Writing',
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
  ) {}

  ionViewWillEnter(): void {
    if (!this.preferencesService.hasPreferences()) {
      this.router.navigateByUrl('/preferences', { replaceUrl: true });
      return;
    }

    this.preferredCategories = this.preferencesService.getPreferences().categories;
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

  goToStore(): void {
    this.router.navigateByUrl('/store');
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

  async openContactSheet(): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: 'Contact us',
      buttons: [
        {
          text: 'Go to login',
          icon: 'log-in-outline',
          handler: () => {
            this.router.navigateByUrl('/login');
          },
        },
        {
          text: 'Create account',
          icon: 'person-add-outline',
          handler: () => {
            this.router.navigateByUrl('/register');
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

  openRemarksSheet(): void {
    this.router.navigateByUrl('/feedback');
  }

  async openNavigationScheme(): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: 'Navigation scheme',
      buttons: [
        {
          text: 'Home (this page)',
          icon: 'home-outline',
        },
        {
          text: 'Services list',
          icon: 'grid-outline',
          handler: () => {
            this.router.navigateByUrl('/view-all-services');
          },
        },
        {
          text: 'Freelancers list',
          icon: 'people-outline',
          handler: () => {
            this.router.navigateByUrl('/view-all-freelancers');
          },
        },
        {
          text: 'Authentication',
          icon: 'log-in-outline',
          handler: () => {
            this.router.navigateByUrl('/login');
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
