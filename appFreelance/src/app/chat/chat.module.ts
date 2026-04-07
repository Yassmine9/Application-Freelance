import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatPage } from './chat.page';

const routes: Routes = [
  { path: '', component: ChatPage }
];

@NgModule({
  imports: [ChatPage, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatPageModule {}