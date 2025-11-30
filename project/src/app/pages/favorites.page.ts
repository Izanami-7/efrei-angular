import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CarService } from '../services/car.service';
import { UserService } from '../services/user.service';
import { Car } from '../models/car';
import { CarFilters, CarFiltersComponent } from '../components/car-filters.component';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CarFiltersComponent],
  template: `
    <div class="min-h-screen bg-black py-12">
      <div class="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <header class="space-y-2 text-white">
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">Vos favoris</p>
          <h1 class="text-3xl font-bold sm:text-4xl">My favorite cars</h1>
          <p class="max-w-2xl text-sm text-slate-200">
            Discover your premium selection and continue the Lowcation adventure with the models that inspire you the most.
          </p>
        </header>

        <ng-container *ngIf="auth.isLoggedIn(); else needLogin">
          <div class="overflow-hidden rounded-3xl bg-white/95 p-3 shadow-2xl shadow-black/10 ring-1 ring-white/30">
            <app-car-filters (filtersChanged)="onFiltersChanged($event)"></app-car-filters>
          </div>

          <ng-container *ngIf="filteredCars().length; else noFavs">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <article
                class="group flex h-full flex-col rounded-2xl bg-white/95 p-4 shadow-xl shadow-black/10 ring-1 ring-slate-200/70 transition hover:-translate-y-1 hover:shadow-2xl"
                *ngFor="let car of filteredCars()"
              >
                <div class="relative overflow-hidden rounded-xl bg-slate-100">
                  <img
                    *ngIf="car.imageUrl"
                    [src]="car.imageUrl"
                    [alt]="car.brand + ' ' + car.model"
                    class="h-44 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-48"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                <div class="mt-4 flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    <h3 class="text-lg font-semibold text-slate-900">{{ car.brand }} {{ car.model }}</h3>
                    <p class="text-sm font-medium text-slate-600">{{ car.color }} · {{ car.releaseYear }} · {{ car.transmission }}</p>
                  </div>
                  <div class="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-[#ff5f00]">
                    {{ car.pricePerDay | currency: 'EUR' }} / day
                  </div>
                </div>

                <p class="mt-3 text-sm leading-relaxed text-slate-600">{{ car.description }}</p>

                <div class="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                  <span class="rounded-full bg-slate-100 px-3 py-1">Color : {{ car.color }}</span>
                  <span class="rounded-full bg-slate-100 px-3 py-1">Year : {{ car.releaseYear }}</span>
                  <span class="rounded-full bg-slate-100 px-3 py-1">{{ car.transmission }}</span>
                </div>

                <div class="mt-6 flex flex-wrap gap-3">
                  <a
                    [routerLink]="['/cars', car.id]"
                    class="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#ff5f00] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-md shadow-orange-500/30 transition hover:-translate-y-0.5 hover:shadow-orange-500/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                  >
                    View details
                  </a>
                  <button
                    (click)="toggleFavorite(car)"
                    class="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-red-700 transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                  >
                    Remove from favorites
                  </button>
                </div>
              </article>
            </div>
          </ng-container>
        </ng-container>

        <ng-template #noFavs>
          <div class="rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-slate-100 shadow-inner shadow-black/20">
            <p class="text-lg font-semibold">You dont have favorite yet.</p>
            <p class="mt-2 text-sm text-slate-300">Explore our catalog and choose which car you like.</p>
          </div>
        </ng-template>

        <ng-template #needLogin>
          <div class="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-100 shadow-inner shadow-black/20">
            <p class="text-lg font-semibold">Connect to access to your favorite</p>
            <p class="mt-2 text-sm text-slate-300">Identify to find a personnalized collection</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: []
})
export class FavoritesPage {
  private filters = signal<CarFilters>({ brand: '', color: '', releaseYear: '', transmission: '' });
  readonly auth = inject(AuthService);
  private carService = inject(CarService);
  private userService = inject(UserService);

  favoriteCars = computed<Car[]>(() =>
    (this.auth.getCurrentUser()?.favoriteCars || [])
      .map((id) => this.carService.getCarById(id))
      .filter((c): c is Car => !!c)
  );
  filteredCars = computed(() => this.applyFilters(this.favoriteCars(), this.filters()));

  toggleFavorite(car: Car): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    this.userService.toggleFavorite(user.id, car.id);
  }

  onFiltersChanged(filters: CarFilters): void {
    this.filters.set(filters);
  }

  private applyFilters(cars: Car[], filters: CarFilters): Car[] {
    return cars.filter((car) => {
      const matchesBrand = !filters.brand || car.brand.toLowerCase().includes(filters.brand.toLowerCase());
      const matchesColor =
        !filters.color || (!!car.color && car.color.toLowerCase().includes(filters.color.toLowerCase()));
      const matchesYear = !filters.releaseYear || car.releaseYear === Number(filters.releaseYear);
      const matchesTrans = !filters.transmission || car.transmission === filters.transmission;
      return matchesBrand && matchesColor && matchesYear && matchesTrans;
    });
  }
}
