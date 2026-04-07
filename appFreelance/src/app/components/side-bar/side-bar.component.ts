import { Component, Input } from '@angular/core';
import { ActionSheetController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FreelanceAuthHelper } from '../../services/freelance-auth-helper.service';

type SideBarTab = 'home' | 'store' | 'join' | 'feedback' | 'nav' | 'offers' | 'action' | 'messages' | 'profile';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class SideBarComponent {
  @Input() activeTab: SideBarTab = 'home';

  constructor(
    private readonly router: Router,
    private readonly actionSheetController: ActionSheetController,
    private readonly auth: FreelanceAuthHelper
  ) {}

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get offersLabel(): string {
    return this.auth.isClient() ? 'My offers' : 'Offers';
  }

  get actionLabel(): string {
    return this.auth.isClient() ? 'Post' : 'Proposals';
  }

  get actionIcon(): string {
    return this.auth.isClient() ? 'add-outline' : 'document-text-outline';
  }

  goHome(): void {
    this.router.navigateByUrl('/home');
  }

  goToOffers(): void {
    if (this.auth.isClient()) {
      this.router.navigateByUrl('/my-offers');
      return;
    }

    this.router.navigateByUrl('/offers');
  }

  goToMessages(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.router.navigateByUrl('/conversations');
  }

  goToProfile(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const role = this.auth.getRole() || 'client';
    const userId = this.auth.getUserId();
    this.router.navigateByUrl(`/profile/${role}/${userId}`);
  }

  goToAction(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    if (this.auth.isClient()) {
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
