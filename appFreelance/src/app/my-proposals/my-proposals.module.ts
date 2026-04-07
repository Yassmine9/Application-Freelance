import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyProposalsPage } from './my-proposals.page';

const routes: Routes = [
  { path: '', component: MyProposalsPage }
];

@NgModule({
  imports: [MyProposalsPage, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyProposalsPageModule {}
