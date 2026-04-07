import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GigDetailPage } from './gig-detail.page';

const routes: Routes = [
  {
    path: ':id',
    component: GigDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GigDetailPageRoutingModule {}
