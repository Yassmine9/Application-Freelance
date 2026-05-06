import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ViewAllfreelancersPageRoutingModule } from './view-all-freelancers-routing.module';
import { ViewAllfreelancersPage } from './view-all-freelancers.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ViewAllfreelancersPageRoutingModule],
  declarations: [ViewAllfreelancersPage],
})
export class ViewAllfreelancersPageModule {}
