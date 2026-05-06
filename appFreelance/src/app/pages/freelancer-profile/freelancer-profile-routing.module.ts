import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FreelancerProfilePage } from './freelancer-profile.page';

const routes: Routes = [
  {
    path: '',
    component: FreelancerProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FreelancerProfilePageRoutingModule {}