import { Component, Input, OnInit } from '@angular/core';
import { ActionSheetController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type ToolBarTab =
  | 'home' | 'store' | 'join' | 'offers' | 'action'
  | 'messages' | 'profile' | 'search';

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
  showActionMenu = false;

  constructor(
    private readonly router: Router,
    private readonly actionSheetController: ActionSheetController,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.updateAuthStatus();
    this.authService.getCurrentUser().subscribe(() => this.updateAuthStatus());
  }

  private updateAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.userRole   = this.authService.getUserRole();
  }

  // ── Navigation ──────────────────────────────────────────────
  goHome():      void { this.router.navigateByUrl('/home'); }
  goToStore():   void { this.router.navigateByUrl('/store'); }
  goToMessages():void {
    if (!this.authService.isLoggedIn()) { this.router.navigateByUrl('/login'); return; }
    this.router.navigateByUrl('/conversations');
  }

  goToProfile(): void {
    if (!this.authService.isLoggedIn()) { this.router.navigateByUrl('/login'); return; }
      const role   = this.authService.getUserRole() || 'client';
      const userId = this.authService.getUserId();
    if (role === 'freelancer') {
    // goes to the merged public/owner profile
      this.router.navigateByUrl(`/freelancer-profile/${userId}`);
    } else {
      this.router.navigateByUrl(`/profile/client/${userId}`);
    }
  }
  goToOffers(): void {
    if (this.authService.isClient()) {
      this.router.navigateByUrl('/my-offers');
    } else {
      this.router.navigateByUrl('/offers');
    }
  }

  // ── Freelancer popup actions ─────────────────────────────────
  goToMyGigs(): void { this.router.navigateByUrl('/my-gigs'); }
  goToMyJobs(): void { this.router.navigateByUrl('/my-jobs'); }

  toggleActionMenu():  void { this.showActionMenu = !this.showActionMenu; }
  closeActionMenu():   void { this.showActionMenu = false; }

  // ── Sheets ───────────────────────────────────────────────────
  async openContactSheet(): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: 'Welcome to FreelanceHub',
      buttons: [
        { text: 'Log in',          icon: 'log-in-outline',    handler: () => this.router.navigateByUrl('/login') },
        { text: 'Create account',  icon: 'person-add-outline', handler: () => this.router.navigateByUrl('/register') },
        { text: 'Cancel', role: 'cancel' },
      ],
    });
    await actionSheet.present();
  }

  logout(): void {
    this.authService.logout();
    this.updateAuthStatus();
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }
}