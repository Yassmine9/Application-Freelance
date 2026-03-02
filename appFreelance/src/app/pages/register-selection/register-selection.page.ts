import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-selection',
  templateUrl: './register-selection.page.html',
  styleUrls: ['./register-selection.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class RegisterSelectionPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    console.log('Register Selection Page Loaded');
  }

  selectFreelancer() {
    this.router.navigate(['/register-freelancer']);
  }

  selectClient() {
    this.router.navigate(['/register-client']);
  }

  selectAdmin() {
    // For now, redirect to client or create admin page later
    this.router.navigate(['/register-client']);
  }

}