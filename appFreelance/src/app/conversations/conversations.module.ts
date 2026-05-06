import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConversationsPage } from './conversations.page';

const routes: Routes = [
  { path: '', component: ConversationsPage }
];

@NgModule({
  imports: [ConversationsPage, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConversationsPageModule {}
