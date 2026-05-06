import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewAllCategoriesPageRoutingModule } from './view-all-categories-routing.module';

import { ViewAllCategoriesPage } from './view-all-categories.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewAllCategoriesPageRoutingModule,
    ViewAllCategoriesPage,
  ],
})
export class ViewAllCategoriesPageModule {}
