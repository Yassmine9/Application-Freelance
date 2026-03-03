import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FreelancerProfilePageRoutingModule } from './freelancer-profile-routing.module';

import { FreelancerProfilePage } from './freelancer-profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FreelancerProfilePageRoutingModule
  ],
 // declarations: [FreelancerProfilePage]
})
export class FreelancerProfilePageModule {}
