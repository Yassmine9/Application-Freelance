import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyGigsPageRoutingModule } from './my-gigs-routing.module';

import { MyGigsPage } from './my-gigs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyGigsPageRoutingModule,MyGigsPage
  ],
  
})
export class MyGigsPageModule {}
