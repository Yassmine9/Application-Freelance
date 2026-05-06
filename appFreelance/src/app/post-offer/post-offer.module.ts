import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostOfferPage } from './post-offer.page';

const routes: Routes = [
  { path: '', component: PostOfferPage }
];

@NgModule({
  imports: [PostOfferPage, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostOfferPageModule {}
