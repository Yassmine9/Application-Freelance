import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GigOrderPlacementPage } from './gig-order-placement.page';

const routes: Routes = [
  {
    path: '',
    component: GigOrderPlacementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GigOrderPlacementPageRoutingModule {}
