import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});

@Component({
  selector: 'app-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #mapEl class="map"></div>
    @if (locationDenied) {
      <p class="hint">Location unavailable — showing place only.</p>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .map {
        height: 300px;
        width: 100%;
        border-radius: 4px;
      }
      .hint {
        font-size: 0.8rem;
        color: #666;
        margin: 0.5rem 0 0;
      }
    `,
  ],
})
export class MapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) lat!: number;
  @Input({ required: true }) lng!: number;
  @Input() name = '';

  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>;

  locationDenied = false;

  private map?: L.Map;
  private placeMarker?: L.Marker;
  private userMarker?: L.Marker;
  private viewReady = false;
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.initMap();
  }

  ngOnChanges(): void {
    if (!this.viewReady) return;

    if (!this.map) {
      this.initMap();
      return;
    }
    this.map.setView([this.lat, this.lng], 15);
    this.placeMarker?.setLatLng([this.lat, this.lng]).bindPopup(this.name);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }

  private initMap(): void {
    const el = this.mapEl.nativeElement;
    this.map = L.map(el).setView([this.lat, this.lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.placeMarker = L.marker([this.lat, this.lng]).addTo(this.map).bindPopup(this.name);

    this.resizeObserver = new ResizeObserver(() => {
      this.map?.invalidateSize();
    });
    this.resizeObserver.observe(el);

    requestAnimationFrame(() => this.map?.invalidateSize());

    this.requestGeolocation();
  }

  private requestGeolocation(): void {
    if (!('geolocation' in navigator)) {
      this.locationDenied = true;
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!this.map) return;
        this.userMarker = L.marker([pos.coords.latitude, pos.coords.longitude])
          .addTo(this.map)
          .bindPopup('You are here');
      },
      () => {
        this.locationDenied = true;
      },
    );
  }
}
