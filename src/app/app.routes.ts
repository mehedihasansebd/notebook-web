import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'posts' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register').then((m) => m.Register),
  },
  {
    path: 'posts',
    loadComponent: () => import('./features/posts/posts-page').then((m) => m.PostsPage),
    //loadComponent: () => import('./features/posts/posts-page').then((m) => m.PostsPage),
  },
  {
    path: 'users/:id',
    //loadComponent: () => import('./features/users/user-page').then((m) => m.UserPage),
    loadComponent: () =>      import('./features/posts/user-posts-page').then((m) => m.UserPostsPage),
  },
  {
    path: 'notes',
    canActivate: [authGuard],
    loadComponent: () => import('./features/notes/notes-page').then((m) => m.NotesPage),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile-page').then((m) => m.ProfilePage),
    //loadComponent: () => import('./features/profile/profile-page').then((m) => m.ProfilePage),
  },
  {
    path: 'admin/users',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-users').then((m) => m.AdminUsers),
    //loadComponent: () => import('./features/admin/admin-users').then((m) => m.AdminUsers),
  },
  {
    path: 'admin/notes',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-notes').then((m) => m.AdminNotes),
    //loadComponent: () => import('./features/admin/admin-notes').then((m) => m.AdminNotes),
  },
  {
    path: 'admin/interests',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-interests').then((m) => m.AdminInterests),
    //loadComponent: () => import('./features/admin/admin-interests').then((m) => m.AdminInterests),
  },
  { path: '**', redirectTo: 'posts' },
];