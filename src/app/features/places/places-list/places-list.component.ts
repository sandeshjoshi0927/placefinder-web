import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { PlacesService } from '../../../core/services/places.service';
import { Place } from '../../../core/models/place.model';

type LoadState = 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-places-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './places-list.component.html',
  styleUrl: './places-list.component.css',
})
export class PlacesListComponent {
  private placesService = inject(PlacesService);

  readonly state = signal<LoadState>('loading');
  readonly places = signal<Place[]>([]);

  searchControl = new FormControl('', { nonNullable: true });

  private searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(startWith(''), debounceTime(500), distinctUntilChanged()),
    { initialValue: '' },
  );

  readonly filteredPlaces = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.places();
    return this.places().filter((p) => p.name.toLowerCase().includes(term));
  });

  constructor() {
    this.load();
  }

  retry(): void {
    this.load();
  }

  private load(): void {
    this.state.set('loading');
    this.placesService.getPlaces().subscribe({
      next: (places) => {
        this.places.set(places);
        this.state.set('loaded');
      },
      error: () => this.state.set('error'),
    });
  }
}
