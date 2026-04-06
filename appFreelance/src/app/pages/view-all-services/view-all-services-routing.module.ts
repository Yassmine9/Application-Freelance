import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewAllServicesPage } from './view-all-services.page';

const routes: Routes = [
  {
    path: '',
    component: ViewAllServicesPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewAllServicesPageRoutingModule {}
