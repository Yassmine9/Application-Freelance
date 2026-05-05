import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { FreelancerGuard } from './guards/freelancer.guard';

const routes: Routes = [

  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register-selection/register-selection.module').then(m => m.RegisterSelectionPageModule)
  },
  {
    path: 'register-freelancers',
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
    loadChildren: () => import('./pages/view-all-freelancers/view-all-freelancers.module').then(m => m.ViewAllfreelancersPageModule)
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
    path: 'my-offers',
    loadChildren: () => import('./my-offers/my-offers.module').then(m => m.MyOffersPageModule)
  },
  {
    path: 'my-proposals',
    loadChildren: () => import('./my-proposals/my-proposals.module').then(m => m.MyProposalsPageModule)
  },
  {
    path: 'post-offer',
    loadChildren: () => import('./post-offer/post-offer.module').then(m => m.PostOfferPageModule)
  },
  {
    path: 'conversations',
    loadChildren: () => import('./conversations/conversations.module').then(m => m.ConversationsPageModule)
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
  {
    path: 'feedback',
    loadChildren: () => import('./pages/feedback/feedback.module').then(m => m.FeedbackPageModule)
  },
  {
    path: 'store',
    loadChildren: () => import('./pages/store/store.module').then(m => m.StorePageModule)
  },
  {
    path: 'product-detail',
    loadChildren: () => import('./pages/product-detail/product-detail.module').then(m => m.ProductDetailPageModule)
  },
  {
    path: 'product/:id',
    loadChildren: () => import('./pages/product-detail/product-detail.module').then(m => m.ProductDetailPageModule)
  },
  {
    path: 'view-all-categories',
    loadChildren: () => import('./pages/view-all-categories/view-all-categories.module').then( m => m.ViewAllCategoriesPageModule)
  },
  {
  path: 'admin',
  loadComponent: () =>
    import('./pages/admin-panel/admin-panel.page')
      .then(m => m.AdminPanelPage)
},
  {
    path: 'admin',
    children: [
      {
        path: 'gigs',
        loadComponent: () =>
          import('./pages/admin-gigs/admin-gigs.page')
            .then(m => m.AdminGigsPage)
      },
      {
        path: 'feedback',
        loadComponent: () =>
          import('./pages/admin-feedback/admin-feedback.page')
            .then(m => m.AdminFeedbackPage)
      },
      {
        path: 'reviews',
        loadComponent: () => 
          import('./pages/admin-reviews/admin-reviews.page')
            .then( m => m.AdminReviewsPage)
      },
      {
        path: 'products',
        loadComponent: () => 
          import('./pages/admin-products/admin-products.page')
            .then( m => m.AdminProductsPage)
      },
      {
        path: 'users',
        loadComponent: () => 
          import('./pages/admin-users/admin-users.page')
        .then( m => m.AdminUsersPage)
      }
    ]
  },
  {
    path: 'freelancers-profile',
    loadChildren: () => import('./pages/freelancer-profile/freelancer-profile.module').then(m => m.freelancersProfilePageModule),
    canActivate: [FreelancerGuard]
  },
  {
    path: 'client-profile',
    loadChildren: () => import('./pages/client-profile/client-profile.module').then(m => m.ClientProfilePageModule)
  },
  {
    path: 'gigs',
    loadChildren: () => import('./pages/gigs/gigs.module').then(m => m.GigsPageModule),
  },
  {
    path: 'gig-detail',
    loadChildren: () => import('./pages/gig-detail/gig-detail.module').then(m => m.GigDetailPageModule),
  },
  {
    path: 'my-gigs',
    loadChildren: () => import('./pages/my-gigs/my-gigs.module').then(m => m.MyGigsPageModule),
    canActivate: [FreelancerGuard]
  },
  {
    path: 'my-jobs',
    loadComponent: () => import('./pages/my-jobs/my-jobs.page').then(m => m.MyJobsPage),
    canActivate: [FreelancerGuard]
  },
  {
    path: 'create-gig',
    loadChildren: () => import('./pages/create-gig/create-gig-routing.module').then(m => m.CreateGigPageModule),
    canActivate: [FreelancerGuard]
  },
  {
    path: 'edit-gig/:id',
    loadChildren: () => import('./pages/edit-gig/edit-gig-routing.module').then(m => m.EditGigPageModule),
    canActivate: [FreelancerGuard]
  },
  {
    path: 'freelancers-edit',
    loadChildren: () => import('./pages/freelancer-edit/freelancer-edit.module').then(m => m.freelancersEditPageModule)
  },
  {
  path: 'search',
  loadChildren: () => import('./pages/search/search-routing.module').then(m => m.SearchPageRoutingModule)
  },
  {
  path: 'view-freelancer-profile/:id',
  loadChildren: () => import('./pages/view-freelancer-profile/view-freelancer-profile-routing.module').then(m => m.ViewFreelancerProfileRoutingModule)
  },
  { path: '**', redirectTo: 'login' }
  ];


@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
