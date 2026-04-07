import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { FreelancerProfilePage } from './pages/freelancer-profile/freelancer-profile.page';
import { FreelancerGuard } from './guards/freelancer.guard';

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
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'freelancer-profile',
    component: FreelancerProfilePage,
    canActivate: [FreelancerGuard]
  },
  {
    path: 'gigs',
    loadChildren: () => import('./pages/gigs/gigs.module').then( m => m.GigsPageModule),
  },
  {
    path: 'gig-detail',
    loadChildren: () => import('./pages/gig-detail/gig-detail.module').then( m => m.GigDetailPageModule),
  },
  {
    path: 'my-gigs',
    loadChildren: () => import('./pages/my-gigs/my-gigs.module').then( m => m.MyGigsPageModule),
    canActivate: [FreelancerGuard]
  },
  {
    path: 'create-gig',
    loadChildren: () => import('./pages/create-gig/create-gig-routing.module').then( m => m.CreateGigPageModule),
    canActivate: [FreelancerGuard]
  },
  {
    path: 'edit-gig/:id',
    loadChildren: () => import('./pages/edit-gig/edit-gig-routing.module').then( m => m.EditGigPageModule),
    canActivate: [FreelancerGuard]
  },  {
    path: 'freelancer-edit',
    loadChildren: () => import('./pages/freelancer-edit/freelancer-edit.module').then( m => m.FreelancerEditPageModule)
  },


  


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
