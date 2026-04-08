import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GigsPage } from './gigs.page';

const routes: Routes = [
  {
    path: '',
    component: GigsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GigsPageRoutingModule {}
