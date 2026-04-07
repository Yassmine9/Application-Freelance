import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'dev-login',
    loadComponent: () => import('./dev-login/dev-login.page').then(m => m.DevLoginPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register-selection/register-selection.module').then(m => m.RegisterSelectionPageModule)
  },
  {
    path: 'register-freelancer',
    loadChildren: () => import('./pages/register/register-freelancer/register-freelancer.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'register-client',
    loadChildren: () => import('./pages/register/register-client/register-client.module').then(m => m.RegisterClientPageModule)
  },
  {
    path: 'registration-pending',
    loadChildren: () => import('./pages/registration-pending/registration-pending.module').then(m => m.RegistrationPendingPageModule)
  },
  {
    path: 'preferences',
    loadChildren: () => import('./pages/preferences/preferences.module').then(m => m.PreferencesPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
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
    path: 'offers',
    loadChildren: () => import('./offers/offers.module').then(m => m.OffersPageModule)
  },
  {
    path: 'proposals/:id',
    loadChildren: () => import('./proposals/proposals.module').then(m => m.ProposalsPageModule)
  },
  {
    path: 'chat/:offerId/:receiverId',
    loadChildren: () => import('./chat/chat.module').then(m => m.ChatPageModule)
  },
  {
    path: 'chat/:offerId',
    loadChildren: () => import('./chat/chat.module').then(m => m.ChatPageModule)
  },
  {
    path: 'profile/:role/:id',
    loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}