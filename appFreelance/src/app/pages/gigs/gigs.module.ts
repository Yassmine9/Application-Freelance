import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GigsPageRoutingModule } from './gigs-routing.module';

import { GigsPage } from './gigs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GigsPageRoutingModule,
    GigsPage
  ],
 // declarations: [GigsPage]
})
export class GigsPageModule {}
