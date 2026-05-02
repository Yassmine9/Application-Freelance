import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
//import { HttpClientModule } from '@angular/common/http';
import { freelancersProfilePageRoutingModule } from './freelancer-profile-routing.module';
import { freelancersProfilePage } from './freelancer-profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    //HttpClientModule,
    freelancersProfilePageRoutingModule, // ← import instead of declare (because it's standalone)
    freelancersProfilePage
  ], 
  //declarations: [freelancersProfilePage]
})
export class freelancersProfilePageModule {}