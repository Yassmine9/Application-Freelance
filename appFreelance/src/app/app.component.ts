import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private authService: AuthService, private router: Router) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
