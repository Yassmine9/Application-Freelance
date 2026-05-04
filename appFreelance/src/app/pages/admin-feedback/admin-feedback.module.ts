import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminFeedbackPageRoutingModule } from './admin-feedback-routing.module';

import { AdminFeedbackPage } from './admin-feedback.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminFeedbackPageRoutingModule
  ]
})
export class AdminFeedbackPageModule {}
