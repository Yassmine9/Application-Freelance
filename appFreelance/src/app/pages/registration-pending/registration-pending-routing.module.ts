import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistrationPendingPage } from './registration-pending.page';

const routes: Routes = [
  {
    path: '',
    component: RegistrationPendingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrationPendingPageRoutingModule {}
