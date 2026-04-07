import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
//import { HttpClientModule } from '@angular/common/http';
import { FreelancerProfilePageRoutingModule } from './freelancer-profile-routing.module';
import { FreelancerProfilePage } from './freelancer-profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    //HttpClientModule,
    FreelancerProfilePageRoutingModule, // ← import instead of declare (because it's standalone)
    FreelancerProfilePage
  ], 
  //declarations: [FreelancerProfilePage]
})
export class FreelancerProfilePageModule {}