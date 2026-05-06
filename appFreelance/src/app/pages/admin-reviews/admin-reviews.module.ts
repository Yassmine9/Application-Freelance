import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminReviewsPageRoutingModule } from './admin-reviews-routing.module';

import { AdminReviewsPage } from './admin-reviews.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminReviewsPageRoutingModule
  ]
})
export class AdminReviewsPageModule {}
