import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { guestGuard } from '@core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('@features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@features/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'places',
    canActivate: [authGuard],
    loadChildren: () => import('./features/places/places.routes').then((m) => m.PLACES_ROUTES),
  },
  { path: '', pathMatch: 'full', redirectTo: 'places' },
  { path: '**', redirectTo: 'places' },
];
