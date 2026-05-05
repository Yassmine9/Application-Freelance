import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminOffersPage } from './admin-offers.page';

const routes: Routes = [
  {
    path: '',
    component: AdminOffersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminOffersPageRoutingModule {}
