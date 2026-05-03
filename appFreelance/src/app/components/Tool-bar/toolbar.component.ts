import { Component, Input, OnInit } from '@angular/core';
import { ActionSheetController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type ToolBarTab = 'home' | 'store' | 'join' | 'feedback' | 'nav' | 'offers' | 'action' | 'messages' | 'profile' | 'search';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class ToolBarComponent implements OnInit {
  @Input() activeTab: ToolBarTab = 'home';

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
    return this.authService.isClient() ? 'Post' : 'Jobs';
  }

  get actionIcon(): string {
    return this.authService.isClient() ? 'add-outline' : 'briefcase-outline';
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

    this.router.navigateByUrl('/my-jobs');

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
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }
}
