import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewAllFreelancersPage } from './view-all-freelancers.page';

const routes: Routes = [
  {
    path: '',
    component: ViewAllFreelancersPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewAllFreelancersPageRoutingModule {}
