import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminPurchasesPage } from './admin-purchases.page';

const routes: Routes = [
  {
    path: '',
    component: AdminPurchasesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPurchasesPageRoutingModule {}
