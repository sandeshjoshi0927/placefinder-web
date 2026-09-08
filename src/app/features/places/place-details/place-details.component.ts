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

type LoadState = 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-place-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
    console.log('hitting here');

    this.placesService.getPlaceById(this.id).subscribe({
      next: (place) => {
        console.log('hitting here 2');
        this.place.set(place);
        this.state.set('loaded');
      },
      error: () => this.state.set('error'),
    });
  }
}
