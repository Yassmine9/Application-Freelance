import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FreelancerGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.getStoredUser();

    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check if user role is 'freelancers'
    if (user && user.role === 'freelancer') {
      return true;
    }

    // Redirect to home if not a freelancer
    this.router.navigate(['/home']);
    return false;
  }
}
