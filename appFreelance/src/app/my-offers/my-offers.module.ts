import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyOffersPage } from './my-offers.page';

const routes: Routes = [
  { path: '', component: MyOffersPage }
];

@NgModule({
  imports: [MyOffersPage, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyOffersPageModule {}
