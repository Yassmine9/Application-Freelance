import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { freelancersEditPage } from './freelancer-edit.page';

const routes: Routes = [
  {
    path: '',
    component: freelancersEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class freelancersEditPageRoutingModule {}
