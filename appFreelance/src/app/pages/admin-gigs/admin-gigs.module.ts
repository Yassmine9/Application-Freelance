import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminGigsPageRoutingModule } from './admin-gigs-routing.module';

import { AdminGigsPage } from './admin-gigs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminGigsPageRoutingModule
  ]
})
export class AdminGigsPageModule {}
