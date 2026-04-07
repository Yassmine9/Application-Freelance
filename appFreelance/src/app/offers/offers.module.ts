import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OffersPage } from './offers.page';

const routes: Routes = [
  { path: '', component: OffersPage }
];

@NgModule({
  imports: [OffersPage, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OffersPageModule {}