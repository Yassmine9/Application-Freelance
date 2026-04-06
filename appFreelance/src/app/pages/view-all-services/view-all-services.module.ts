import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ViewAllServicesPageRoutingModule } from './view-all-services-routing.module';
import { ViewAllServicesPage } from './view-all-services.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ViewAllServicesPageRoutingModule],
  declarations: [ViewAllServicesPage],
})
export class ViewAllServicesPageModule {}
