import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  // ── Person A routes (commented out until merge) ───────────────────────────
  // { path: 'login', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule) },
  // { path: 'register', loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule) },
  // { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
  // { path: 'freelancer', loadChildren: () => import('./pages/freelancer/freelancer.module').then(m => m.FreelancerPageModule) },
  // { path: 'client', loadChildren: () => import('./pages/client/client.module').then(m => m.ClientPageModule) },
  // { path: 'admin', loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminPageModule) },

  // ── Person C routes (your work) ───────────────────────────────────────────
  {
    path: 'dev-login',
    loadComponent: () => import('./dev-login/dev-login.page').then(m => m.DevLoginPage)
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

  // ── Default ───────────────────────────────────────────────────────────────
  { path: '', redirectTo: 'dev-login', pathMatch: 'full' },
  { path: '**', redirectTo: 'dev-login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}