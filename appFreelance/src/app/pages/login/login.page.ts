import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class LoginPage implements OnInit {
  showPassword: boolean = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  constructor() { }

  ngOnInit() {
  }

}
