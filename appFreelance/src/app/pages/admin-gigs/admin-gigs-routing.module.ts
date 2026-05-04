import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminGigsPage } from './admin-gigs.page';

const routes: Routes = [
  {
    path: '',
    component: AdminGigsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminGigsPageRoutingModule {}
