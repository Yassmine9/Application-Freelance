import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ViewFreelancerProfilePage } from './view-freelancer-profile.page';

const routes: Routes = [
  {
    path: '',
    component: ViewFreelancerProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewFreelancerProfileRoutingModule { }
