import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminOffersPageRoutingModule } from './admin-offers-routing.module';

import { AdminOffersPage } from './admin-offers.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminOffersPageRoutingModule
  ]
})
export class AdminOffersPageModule {}
