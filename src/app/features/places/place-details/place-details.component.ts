import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlacesService } from '@core/services/places.service';
import { Place } from '@core/models/place.model';
import { MapComponent } from '@features/places/map/map.component';

type LoadState = 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-place-details',
  standalone: true,
  imports: [CommonModule, RouterLink, MapComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './place-details.component.html',
  styleUrl: './place-details.component.css',
})
export class PlaceDetailsComponent implements OnChanges {
  @Input() id!: string;

  private placesService = inject(PlacesService);

  readonly state = signal<LoadState>('loading');
  readonly place = signal<Place | null>(null);

  ngOnChanges(): void {
    this.state.set('loading');

    this.placesService.getPlaceById(this.id).subscribe({
      next: (place) => {
        this.place.set(place);
        this.state.set('loaded');
      },
      error: () => this.state.set('error'),
    });
  }
}
