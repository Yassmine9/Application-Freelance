import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class SideMenuComponent implements OnInit {
  isLoggedIn = false;
  userRole: string | null = null;
  userName = '';
  userInitials = '';
  activeRoute = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly menuController: MenuController,
  ) {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.activeRoute = e.urlAfterRedirects;
      }
    });
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(() => this.updateAuth());
    this.updateAuth();
  }

  private updateAuth(): void {
    this.isLoggedIn  = this.authService.isLoggedIn();
    this.userRole    = this.authService.getUserRole();
    const user       = this.authService.getStoredUser();
    this.userName    = user?.name ?? '';
    const parts      = this.userName.split(' ').filter(Boolean);
    this.userInitials = parts.slice(0, 2).map((p: string) => p[0].toUpperCase()).join('') || '??';
  }

  onLogout(): void {
    this.authService.logout();
    this.updateAuth();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async navigateTo(path: string): Promise<void> {
    await this.router.navigateByUrl(path);
    await this.menuController.close('main-menu');
  }
}