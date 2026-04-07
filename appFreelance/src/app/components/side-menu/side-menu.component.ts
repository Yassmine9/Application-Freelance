import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
export class SideMenuComponent {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly menuController: MenuController,
  ) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async navigateTo(path: string): Promise<void> {
    await this.router.navigateByUrl(path);
    await this.menuController.close('main-menu');
  }
}
