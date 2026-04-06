import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ViewAllFreelancersPageRoutingModule } from './view-all-freelancers-routing.module';
import { ViewAllFreelancersPage } from './view-all-freelancers.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ViewAllFreelancersPageRoutingModule],
  declarations: [ViewAllFreelancersPage],
})
export class ViewAllFreelancersPageModule {}
