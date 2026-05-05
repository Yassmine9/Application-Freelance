import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GigOrderPlacementPageRoutingModule } from './gig-order-placement-routing.module';

import { GigOrderPlacementPage } from './gig-order-placement.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GigOrderPlacementPageRoutingModule,
    GigOrderPlacementPage,
  ]
})
export class GigOrderPlacementPageModule {}
