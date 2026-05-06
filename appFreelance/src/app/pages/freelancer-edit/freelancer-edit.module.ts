import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FreelancerEditPageRoutingModule } from './freelancer-edit-routing.module';

import { FreelancerEditPage } from './freelancer-edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FreelancerEditPageRoutingModule,FreelancerEditPage
  ],
  declarations: []
})
export class FreelancerEditPageModule {}