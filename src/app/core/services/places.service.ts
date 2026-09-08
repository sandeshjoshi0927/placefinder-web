import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Place } from '../models/place.model';

@Injectable({ providedIn: 'root' })
export class PlacesService {
  private http = inject(HttpClient);

  getPlaces(): Observable<Place[]> {
    return this.http.get<Place[]>(`${environment.apiUrl}/places`);
  }

  getPlaceById(id: string | number): Observable<Place> {
    return this.http.get<Place>(`${environment.apiUrl}/places/${id}`);
  }
}
