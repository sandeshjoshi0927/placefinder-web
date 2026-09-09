import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { PlacesService } from '@core/services/places.service';
import { Place } from '@core/models/place.model';

type LoadState = 'loading' | 'loaded' | 'error';
const ALL_CATEGORIES = 'All';

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
  private destroyRef = inject(DestroyRef);

  readonly state = signal<LoadState>('loading');
  readonly places = signal<Place[]>([]);

  searchControl = new FormControl('', { nonNullable: true });
  categoryControl = new FormControl(ALL_CATEGORIES, { nonNullable: true });

  private searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(startWith(''), debounceTime(500), distinctUntilChanged()),
    { initialValue: '' },
  );

  private selectedCategory = toSignal(
    this.categoryControl.valueChanges.pipe(startWith(ALL_CATEGORIES)),
    { initialValue: ALL_CATEGORIES },
  );

  readonly categories = computed(() => {
    const unique = new Set(this.places().map((p) => p.category));
    return [ALL_CATEGORIES, ...Array.from(unique).sort()];
  });

  readonly filteredPlaces = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();

    return this.places().filter((p) => {
      const matchesTerm = !term || p.name.toLowerCase().includes(term);
      const matchesCategory = category === ALL_CATEGORIES || p.category === category;
      return matchesTerm && matchesCategory;
    });
  });

  constructor() {
    this.load();
  }

  retry(): void {
    this.load();
  }

  private load(): void {
    this.state.set('loading');
    this.placesService
      .getPlaces()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (places) => {
          this.places.set(places);
          this.state.set('loaded');
        },
        error: () => this.state.set('error'),
      });
  }
}
