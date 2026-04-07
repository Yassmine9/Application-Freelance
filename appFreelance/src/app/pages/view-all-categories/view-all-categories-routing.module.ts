import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewAllCategoriesPage } from './view-all-categories.page';

const routes: Routes = [
  {
    path: '',
    component: ViewAllCategoriesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewAllCategoriesPageRoutingModule {}
