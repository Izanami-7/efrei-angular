import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarService } from '../services/car.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { Car } from '../models/car';
import { CarFilters, CarFiltersComponent } from '../components/car-filters.component';
import { CarCardComponent } from '../components/car-card.component';

@Component({
  selector: 'app-van-list-page',
  standalone: true,
  imports: [CommonModule, CarFiltersComponent, CarCardComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-neutral-900 via-black to-slate-950 py-16 text-white">
      <div class="mx-auto flex max-w-6xl flex-col gap-10 px-4">
        <header class="space-y-4 text-center">
          <p class="text-sm uppercase tracking-[0.35em] text-orange-400">Premium vans</p>
          <h1 class="text-3xl font-bold text-white sm:text-4xl">Travel with extra space</h1>
          <p class="text-lg text-slate-200">Luxurious vans designed for groups, comfort, and effortless journeys.</p>
        </header>

        <app-car-filters (filtersChanged)="onFiltersChanged($event)"></app-car-filters>

        <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <app-car-card
            *ngFor="let van of filteredVans()"
            [car]="van"
            [isFavorite]="isFavorite(van.id)"
            [isLoggedIn]="isLoggedIn"
            (toggleFavorite)="toggleFavorite(van)"
          ></app-car-card>
        </div>
      </div>
    </div>
  `
})
export class VanListPage {
  private filters = signal<CarFilters>({ brand: '', color: '', releaseYear: '', transmission: '' });
  private carService = inject(CarService);
  private auth = inject(AuthService);
  private userService = inject(UserService);

  vans = computed(() => this.carService.cars().filter((car) => (car.type ?? 'car') === 'van'));
  filteredVans = computed<Car[]>(() => this.applyFilters(this.vans(), this.filters()));

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
