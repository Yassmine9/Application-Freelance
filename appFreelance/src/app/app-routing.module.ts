import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'preferences',
    loadChildren: () => import('./pages/preferences/preferences.module').then( m => m.PreferencesPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register-selection/register-selection.module').then( m => m.RegisterSelectionPageModule)
  },
  {
    path: 'register-freelancer',
    loadChildren: () => import('./pages/register/register-freelancer/register-freelancer.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'register-client',
    loadChildren: () => import('./pages/register/register-client/register-client.module').then( m => m.RegisterClientPageModule)
  },
  {
    path: 'registration-pending',
    loadChildren: () => import('./pages/registration-pending/registration-pending.module').then( m => m.RegistrationPendingPageModule)
  },
  {
    path: 'view-all-freelancers',
    loadChildren: () => import('./pages/view-all-freelancers/view-all-freelancers.module').then(m => m.ViewAllFreelancersPageModule)
  },
  {
    path: 'view-all-services',
    loadChildren: () => import('./pages/view-all-services/view-all-services.module').then(m => m.ViewAllServicesPageModule)
  },
  {
    path: 'feedback',
    loadChildren: () => import('./pages/feedback/feedback.module').then(m => m.FeedbackPageModule)
  },
  {
    path: '',
      redirectTo: 'preferences',
    pathMatch: 'full'
  },
  {
    path: 'store',
    loadChildren: () => import('./pages/store/store.module').then( m => m.StorePageModule)
  },
  {
    path: 'product-detail',
    loadChildren: () => import('./pages/product-detail/product-detail.module').then( m => m.ProductDetailPageModule)
  },
  {
  path: 'product/:id',
  loadChildren: () => import('./pages/product-detail/product-detail.module')
    .then(m => m.ProductDetailPageModule)
  },
  {
    path: 'view-all-categories',
    loadChildren: () => import('./pages/view-all-categories/view-all-categories.module').then( m => m.ViewAllCategoriesPageModule)
  },
  {
    path: 'admin-panel',
    loadChildren: () => import('./pages/admin-panel/admin-panel.module').then( m => m.AdminPanelPageModule)
  },
  { path: 'admin', loadComponent: () => import('./pages/admin-panel/admin-panel.page').then(m => m.AdminPanelPage) },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
