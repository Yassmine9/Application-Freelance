import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RegistrationPendingPageRoutingModule } from './registration-pending-routing.module';
import { RegistrationPendingPage } from './registration-pending.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RegistrationPendingPageRoutingModule,
    RegistrationPendingPage
  ]
})
export class RegistrationPendingPageModule {}
