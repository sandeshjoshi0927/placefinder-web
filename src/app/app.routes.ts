import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('@features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'places',
    loadComponent: () => import('@features/places/place.component').then((m) => m.PlaceComponent),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
