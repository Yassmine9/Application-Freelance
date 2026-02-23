import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class RegisterPage implements OnInit {
  showPassword: boolean = false;
  accepted: boolean = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  constructor() { }

  ngOnInit() {
  }

}
