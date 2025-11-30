import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarService } from '../services/car.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { Car } from '../models/car';
import { CarFilters, CarFiltersComponent } from '../components/car-filters.component';
import { CarCardComponent } from '../components/car-card.component';
import { ActivatedRoute } from '@angular/router';
import { SearchPayload, SearchStateService } from '../services/search-state.service';

@Component({
  selector: 'app-car-list-page',
  standalone: true,
  imports: [CommonModule, CarFiltersComponent, CarCardComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-slate-950 py-16 text-white">
      <div class="mx-auto flex max-w-6xl flex-col gap-10 px-4">
        <header class="space-y-4 text-center">
          <p class="text-sm uppercase tracking-[0.35em] text-orange-400">Premium fleet</p>
          <h1 class="text-3xl font-bold text-white sm:text-4xl">Choose your next ride</h1>
          <p class="text-lg text-slate-200">Refined design, dynamic performance, and transparent daily pricing.</p>
        </header>

        <div *ngIf="searchPayload" class="rounded-xl border border-orange-500/30 bg-white/5 p-4 backdrop-blur">
          <div class="flex flex-col gap-2 text-sm text-slate-100 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-wrap items-center gap-3">
              <span class="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-orange-200">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                </svg>
                {{ searchPayload.pickupLocation }}
              </span>
              <span class="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-orange-200">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16m-7 5h7" />
                </svg>
                {{ searchPayload.returnLocation }}
              </span>
              <span class="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-orange-200">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v5.25H4.5l7.5 9 7.5-9h-2.25V3z" />
                </svg>
                {{ searchPayload.startDate | date: 'medium' }} → {{ searchPayload.endDate | date: 'medium' }}
              </span>
            </div>
            <div class="text-xs text-slate-300">Showing vehicles without login — reserve when you're ready.</div>
          </div>
        </div>

        <app-car-filters (filtersChanged)="onFiltersChanged($event)"></app-car-filters>

        <div *ngIf="loading()" class="text-center text-sm text-slate-300">Chargement des voitures...</div>

        <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <app-car-card
            *ngFor="let car of filteredCars()"
            [car]="car"
            [isFavorite]="isFavorite(car.id)"
            [isLoggedIn]="isLoggedIn"
            (toggleFavorite)="toggleFavorite(car)"
          ></app-car-card>
        </div>
      </div>
    </div>
  `
})
export class CarListPage implements OnInit {
  private filters = signal<CarFilters>({ brand: '', color: '', releaseYear: '', transmission: '' });
  private carService = inject(CarService);
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private searchState = inject(SearchStateService);
  loading = signal<boolean>(true);

  cars = computed(() => this.carService.cars().filter((car) => (car.type ?? 'car') === 'car'));
  filteredCars = computed<Car[]>(() => this.applyFilters(this.cars(), this.filters()));
  searchPayload: SearchPayload | null = null;

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const payload: SearchPayload = {
        pickupLocation: params.get('pickupLocation') ?? '',
        returnLocation: params.get('returnLocation') ?? '',
        startDate: params.get('startDate') ?? '',
        endDate: params.get('endDate') ?? ''
      };

      const hasValues = Object.values(payload).some((value) => !!value);
      if (hasValues) {
        this.searchState.setSearchPayload(payload);
        this.searchPayload = payload;
      } else {
        this.searchPayload = this.searchState.getSearchPayload();
      }
    });
  }

  ngOnInit(): void {
    this.carService.loadCars().subscribe({
      next: (cars) => {
        console.log('[CarListPage] Cars loaded for listing', cars);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('[CarListPage] Error loading cars', error);
        this.loading.set(false);
      }
    });
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  isFavorite(carId: number): boolean {
    const favorites = this.auth.getCurrentUser()?.favoriteCars ?? [];
    return favorites.includes(carId);
  }

  toggleFavorite(car: Car): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    this.userService.toggleFavorite(user.id, car.id);
  }

  onFiltersChanged(filters: CarFilters): void {
    this.filters.set(filters);
  }

  private applyFilters(cars: Car[], filters: CarFilters): Car[] {
    const brandFilter = filters.brand?.trim().toLowerCase();
    const colorFilter = filters.color?.trim().toLowerCase();
    const transmissionFilter = filters.transmission?.trim().toLowerCase();

    const releaseYearInput = filters.releaseYear?.toString().trim() ?? '';
    const releaseYearFilter =
      releaseYearInput === '' ? null : Number.isFinite(Number(releaseYearInput)) ? Number(releaseYearInput) : null;

    const hasActiveFilters = !!brandFilter || !!colorFilter || !!transmissionFilter || releaseYearFilter !== null;

    if (!hasActiveFilters) {
      return cars;
    }

    return cars.filter((car) => {
      const matchesBrand = !brandFilter || car.brand.toLowerCase().includes(brandFilter);
      const matchesColor = !colorFilter || (!!car.color && car.color.toLowerCase().includes(colorFilter));

      const carYear = car.releaseYear ?? null;
      const matchesYear = releaseYearFilter === null || carYear === releaseYearFilter;

      const carTransmission = car.transmission?.toLowerCase();
      const matchesTrans =
        !transmissionFilter ||
        carTransmission === transmissionFilter ||
        (transmissionFilter === 'automatique' && carTransmission === 'automatic') ||
        (transmissionFilter === 'manuelle' && carTransmission === 'manual');

      return matchesBrand && matchesColor && matchesYear && matchesTrans;
    });
  }
}
