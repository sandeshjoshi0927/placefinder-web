import { Routes } from '@angular/router';

export const PLACES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./places-list/places-list.component').then((m) => m.PlacesListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./place-details/place-details.component').then((m) => m.PlaceDetailsComponent),
  },
];
