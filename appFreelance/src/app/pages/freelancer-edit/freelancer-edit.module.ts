import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { freelancersEditPageRoutingModule } from './freelancer-edit-routing.module';

import { freelancersEditPage } from './freelancer-edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    freelancersEditPageRoutingModule,freelancersEditPage
  ],
  declarations: []
})
export class freelancersEditPageModule {}
