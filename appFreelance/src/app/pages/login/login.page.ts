import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    if (!this.email || !this.password) {
      const alert = await this.alertCtrl.create({
        header: 'Erreur',
        message: 'Email et mot de passe requis.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Connexion...' });
    await loading.present();

    this.authService.login(this.email, this.password).subscribe({
      next: async (res) => {
        await loading.dismiss();
        if (res.status === 'pending') {
          this.router.navigate(['/registration-pending']);
        } else {
          const role = res?.user?.role;
          this.router.navigate([role === 'freelancer' ? '/offers' : '/home']);
        }
      },
      error: async (err) => {
        await loading.dismiss();
        const alert = await this.alertCtrl.create({
          header: 'Erreur',
          message: err.error?.error || 'Email ou mot de passe incorrect.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}
