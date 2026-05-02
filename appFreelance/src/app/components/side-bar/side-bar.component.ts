<<<<<<< HEAD
import { Component, Input, OnInit } from '@angular/core';
import { ActionSheetController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type SideBarTab = 'home' | 'store' | 'join' | 'search' | 'nav' | 'projects' | 'services' | 'orders' | 'profile';

interface MenuOption {
  label: string;
  icon: string;
  action: 'navigate' | 'logout' | 'sheet';
  route?: string;
}

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class SideBarComponent implements OnInit {
  @Input() activeTab: SideBarTab = 'home';

  isLoggedIn = false;
  userRole: string | null = null;

  constructor(
    private readonly router: Router,
    private readonly actionSheetController: ActionSheetController,
    private readonly authService: AuthService,
  ) {
    this.updateAuthStatus();
  }

  ngOnInit(): void {
    // Subscribe to user changes to update auth status dynamically
    this.authService.getCurrentUser().subscribe(() => {
      this.updateAuthStatus();
    });
  }

  private updateAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.userRole = this.authService.getUserRole();
  }

  get menuOptions(): MenuOption[] {
    if (!this.isLoggedIn) {
      return [];
    }

    const roleSpecificOptions: MenuOption[] = [
      { label: 'Store', icon: 'storefront-outline', action: 'navigate', route: '/store' },
    ];

    if (this.userRole === 'client') {
      roleSpecificOptions.push(
        { label: 'My Projects', icon: 'briefcase-outline', action: 'navigate', route: '/client/projects' },
        { label: 'My Orders', icon: 'cart-outline', action: 'navigate', route: '/client/orders' },
        { label: 'Profile', icon: 'person-circle-outline', action: 'navigate', route: '/client/profile' },
      );
    } else if (this.userRole === 'freelancer') {
      roleSpecificOptions.push(
        { label: 'My Services', icon: 'layers-outline', action: 'navigate', route: '/my-gigs' },
        { label: 'My Orders', icon: 'cart-outline', action: 'navigate', route: '/freelancer/orders' },
        { label: 'Profile', icon: 'person-circle-outline', action: 'navigate', route: '/freelancer-profile' },
      );
    }



    return roleSpecificOptions;
  }

  handleMenuAction(option: MenuOption): void {
    if (option.action === 'navigate' && option.route) {
      this.router.navigateByUrl(option.route);
    } else if (option.action === 'logout') {
      this.logout();
    }
  }

  goHome(): void {
    this.router.navigateByUrl('/home');
  }

  goToStore(): void {
    this.router.navigateByUrl('/store');
  }

  openSearch(): void {
    this.router.navigateByUrl('/search');
  }

  logout(): void {
    this.authService.logout();
    this.updateAuthStatus();
    this.router.navigateByUrl('/home', { replaceUrl: true });
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

  async openNavigationScheme(): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: 'Navigation scheme',
      buttons: [
        {
          text: 'Home ',
          icon: 'home-outline',
          handler: () => {
            this.router.navigateByUrl('/home');
          },
        },
        {
          text: 'Search',
          icon: 'search-outline',
          handler: () => {
            this.router.navigateByUrl('/search');
          },
        },
        {
          text: 'All Gigs',
          icon: 'briefcase-outline',
          handler: () => {
            this.router.navigateByUrl('/gigs');
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
          text: 'Categories',
          icon: 'layers-outline',
          handler: () => {
            this.router.navigateByUrl('/view-all-categories');
          },
        },
        {
          text: 'Store',
          icon: 'storefront-outline',
          handler: () => {
            this.router.navigateByUrl('/store');
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
=======
import { Component, Input, OnInit } from '@angular/core';
import { ActionSheetController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type SideBarTab = 'home' | 'store' | 'join' | 'feedback' | 'nav' | 'offers' | 'action' | 'messages' | 'profile' | 'search';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class SideBarComponent implements OnInit {
  @Input() activeTab: SideBarTab = 'home';

  isLoggedIn = false;
  userRole: string | null = null;

  constructor(
    private readonly router: Router,
    private readonly actionSheetController: ActionSheetController,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.updateAuthStatus();
    this.authService.getCurrentUser().subscribe(() => {
      this.updateAuthStatus();
    });
  }

  private updateAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.userRole = this.authService.getUserRole();
  }

  get offersLabel(): string {
    return this.authService.isClient() ? 'My offers' : 'Offers';
  }

  get actionLabel(): string {
    return this.authService.isClient() ? 'Post' : 'Proposals';
  }

  get actionIcon(): string {
    return this.authService.isClient() ? 'add-outline' : 'document-text-outline';
  }

  goHome(): void {
    this.router.navigateByUrl('/home');
  }

  goToOffers(): void {
    if (this.authService.isClient()) {
      this.router.navigateByUrl('/my-offers');
      return;
    }

    this.router.navigateByUrl('/offers');
  }

  goToMessages(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.router.navigateByUrl('/conversations');
  }

  goToProfile(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const role = this.authService.getUserRole() || 'client';
    const userId = this.authService.getUserId();
    this.router.navigateByUrl(`/profile/${role}/${userId}`);
  }

  goToAction(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    if (this.authService.isClient()) {
      this.router.navigateByUrl('/post-offer');
      return;
    }

    this.router.navigateByUrl('/my-proposals');
  }

  goToStore(): void {
    this.router.navigateByUrl('/view-all-services');
  }

  goToFeedback(): void {
    this.router.navigateByUrl('/feedback');
  }

  openSearch(): void {
    this.router.navigateByUrl('/search');
  }

  logout(): void {
    this.authService.logout();
    this.updateAuthStatus();
    this.router.navigateByUrl('/home', { replaceUrl: true });
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

  async openNavigationScheme(): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: 'Navigation scheme',
      buttons: [
        {
          text: 'Home (this page)',
          icon: 'home-outline',
          handler: () => {
            this.router.navigateByUrl('/home');
          },
        },
        {
          text: 'Search',
          icon: 'search-outline',
          handler: () => {
            this.router.navigateByUrl('/search');
          },
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
          text: 'Categories',
          icon: 'layers-outline',
          handler: () => {
            this.router.navigateByUrl('/view-all-categories');
          },
        },
        {
          text: 'Store',
          icon: 'storefront-outline',
          handler: () => {
            this.router.navigateByUrl('/store');
          },
        },
        {
          text: 'All Gigs',
          icon: 'briefcase-outline',
          handler: () => {
            this.router.navigateByUrl('/gigs');
          },
        },
        {
          text: 'Preferences',
          icon: 'settings-outline',
          handler: () => {
            this.router.navigateByUrl('/preferences');
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
>>>>>>> 6b59ef5a68305f928c7c8454619016c1a7ead24c
