import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProposalsPage } from './proposals.page';

const routes: Routes = [
  { path: '', component: ProposalsPage }
];

@NgModule({
  imports: [ProposalsPage, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProposalsPageModule {}