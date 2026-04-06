import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
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
    path: '',
      redirectTo: 'home',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
