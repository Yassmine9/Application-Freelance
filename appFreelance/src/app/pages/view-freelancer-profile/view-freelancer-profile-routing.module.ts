import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ViewfreelancersProfilePage } from './view-freelancer-profile.page';

const routes: Routes = [
  {
    path: '',
    component: ViewfreelancersProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewfreelancersProfileRoutingModule { }
