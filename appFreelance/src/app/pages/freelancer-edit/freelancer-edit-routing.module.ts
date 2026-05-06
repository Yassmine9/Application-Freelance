import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FreelancerEditPage } from './freelancer-edit.page';

const routes: Routes = [
  {
    path: '',
    component: FreelancerEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FreelancerEditPageRoutingModule {}