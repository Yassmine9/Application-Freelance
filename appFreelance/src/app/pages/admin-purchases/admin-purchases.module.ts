import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminPurchasesPageRoutingModule } from './admin-purchases-routing.module';

import { AdminPurchasesPage } from './admin-purchases.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminPurchasesPageRoutingModule
  ]
})
export class AdminPurchasesPageModule {}
