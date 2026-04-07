import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GigDetailPageRoutingModule } from './gig-detail-routing.module';

import { GigDetailPage } from './gig-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GigDetailPageRoutingModule,GigDetailPage
  ],
  
})
export class GigDetailPageModule {}
