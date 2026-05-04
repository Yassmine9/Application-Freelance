import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminFeedbackPage } from './admin-feedback.page';

const routes: Routes = [
  {
    path: '',
    component: AdminFeedbackPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminFeedbackPageRoutingModule {}
