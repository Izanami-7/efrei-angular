import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CarService } from '../services/car.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { Car } from '../models/car';
import { SearchStateService } from '../services/search-state.service';
import { ReservationService } from '../services/reservation.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-car-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div *ngIf="car() as c; else fallback" class="min-h-screen bg-neutral-950 text-white">
      <section
        class="relative isolate overflow-hidden bg-neutral-900/80"
        [style.backgroundImage]="
          'linear-gradient(to bottom, rgba(10,10,10,0.8), rgba(10,10,10,0.9)), url(' +
          (c.imageUrl || fallbackImage) +
          ')'
        "
      >
        <div class="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
        <div class="container mx-auto px-4 py-16 lg:py-20 grid lg:grid-cols-12 gap-8 items-end">
          <div class="lg:col-span-7 space-y-6 relative z-10">
            <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm uppercase tracking-[0.2em] text-amber-300/80">
              Premium Selection
            </div>
            <div class="space-y-4">
              <p class="text-sm text-neutral-300">{{ c.brand }}</p>
              <h1 class="text-4xl sm:text-5xl font-bold leading-tight">{{ c.model }}</h1>
              <p class="max-w-2xl text-lg text-neutral-300">{{ c.description }}</p>
            </div>
            <div class="flex flex-wrap items-center gap-4">
              <div class="rounded-2xl bg-white/5 px-5 py-4 shadow-lg shadow-black/30">
                <p class="text-sm text-neutral-300">From</p>
                <p class="text-3xl font-semibold text-amber-400">
                  {{ c.pricePerDay | currency: 'EUR' }}
                  <span class="text-base text-neutral-300">/ jour</span>
                </p>
              </div>
            </div>
          </div>
          <div class="lg:col-span-5 relative z-10">
            <div class="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40">
              <img
                [src]="c.imageUrl || fallbackImage"
                [alt]="c.brand + ' ' + c.model"
                class="h-full max-h-[420px] w-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      <section class="container mx-auto px-4 py-12 lg:py-16 grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="grid sm:grid-cols-2 gap-4">
            <div class="rounded-2xl bg-white text-neutral-900 p-5 shadow-xl shadow-black/10 flex items-center gap-4">
              <div class="h-12 w-12 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center font-semibold">Color</div>
              <div>
                <p class="text-sm text-neutral-500">Tint</p>
                <p class="text-lg font-semibold">{{ c.color }}</p>
              </div>
            </div>
            <div class="rounded-2xl bg-white text-neutral-900 p-5 shadow-xl shadow-black/10 flex items-center gap-4">
              <div class="h-12 w-12 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center font-semibold">Year</div>
              <div>
                <p class="text-sm text-neutral-500">Putting into circulation</p>
                <p class="text-lg font-semibold">{{ c.releaseYear }}</p>
              </div>
            </div>
            <div class="rounded-2xl bg-white text-neutral-900 p-5 shadow-xl shadow-black/10 flex items-center gap-4">
              <div class="h-12 w-12 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center font-semibold">Box</div>
              <div>
                <p class="text-sm text-neutral-500">Transmission</p>
                <p class="text-lg font-semibold capitalize">{{ c.transmission }}</p>
              </div>
            </div>
          </div>

          <div class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
            <h2 class="text-2xl font-semibold mb-3">About this model</h2>
            <p class="text-neutral-200 leading-relaxed">{{ c.description }}</p>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="sticky top-6 rounded-3xl border border-white/10 bg-white text-neutral-900 shadow-2xl shadow-black/20 p-6 space-y-6">
            <div>
              <p class="text-sm text-neutral-500">Model</p>
              <h3 class="text-2xl font-semibold">{{ c.brand }} {{ c.model }}</h3>
            </div>
            <div class="flex items-baseline gap-2">
              <p class="text-4xl font-bold text-amber-500">{{ c.pricePerDay | currency: 'EUR' }}</p>
              <span class="text-neutral-500">/ day</span>
            </div>
            <div class="space-y-3">
              <button
                class="w-full rounded-xl bg-amber-500 px-4 py-3 text-base font-semibold text-neutral-900 shadow-lg shadow-amber-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/40"
                (click)="reserveCar()"
              >
                Reserve the car
              </button>
              
              <button
                *ngIf="isLoggedIn"
                class="w-full rounded-xl border border-neutral-200 px-4 py-3 text-base font-semibold text-neutral-800 transition hover:bg-neutral-100"
                (click)="toggleFavorite()"
              >
                {{ isFavorite ? 'Remove from favorites' : 'Add to favoris' }}
              </button>
              
              <a
                *ngIf="!isLoggedIn"
                routerLink="/login"
                class="block text-center w-full rounded-xl border border-neutral-200 px-4 py-3 text-base font-semibold text-neutral-800 transition hover:bg-neutral-100"
              >
                Log in to add to favorites
              </a>

              <div
                *ngIf="reservationError"
                class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {{ reservationError }}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <ng-template #fallback>
      <ng-container *ngIf="loadError; else loading">
        <div class="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-4 px-4 text-center">
          <p class="text-xl">Car not found.</p>
          <a routerLink="/cars" class="rounded-full bg-amber-500 px-6 py-3 text-neutral-900 font-semibold shadow-lg">Return to list</a>
        </div>
      </ng-container>
    </ng-template>

    <ng-template #loading>
      <div class="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p class="text-lg">Loading the car...</p>
      </div>
    </ng-template>
  `
})
export class CarDetailPage implements OnInit {
  car = signal<Car | null>(null);
  
  fallbackImage = 'https://via.placeholder.com/800x400?text=Voiture';
  reservationError: string | null = null;
  loadError = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carService: CarService,
    private auth: AuthService,
    private userService: UserService,
    private searchState: SearchStateService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      const parsedId = idParam ? Number(idParam) : NaN;

      if (Number.isNaN(parsedId)) {
        this.loadError = true;
        return;
      }
      this.loadCar(parsedId);
    });
  }

  private loadCar(id: number): void {
    this.loadError = false;
    const cachedCar = this.carService.getCarById(id);
    if (cachedCar) {
      console.log('Found in cache, updating signal');
      this.car.set(cachedCar);
      return;
    }
    this.carService.fetchCarById(id).subscribe({
      next: (fetchedCar) => {
        console.log('[CarDetailPage] Signal updated with:', fetchedCar);
        this.car.set(fetchedCar);
      },
      error: (error) => {
        console.error('Error fetching car', error);
        this.car.set(null);
        this.loadError = true;
      }
    });
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get isFavorite(): boolean {
    const user = this.auth.getCurrentUser();
    const currentCar = this.car(); 
    const favoriteIds = user?.favoriteCars ?? [];
    return !!currentCar && favoriteIds.includes(currentCar.id);
  }

  toggleFavorite(): void {
    const user = this.auth.getCurrentUser();
    const currentCar = this.car();
    if (!user || !currentCar) return;
    this.userService.toggleFavorite(user.id, currentCar.id);
  }

  reserveCar(): void {
    this.reservationError = null;
    const currentCar = this.car();
    if (!currentCar) return;
    
    const payload = this.searchState.getSearchPayload();

    if (!payload) {
      this.router.navigate(['/']);
      return;
    }

    if (!this.isLoggedIn) {
      this.searchState.setReservationContext({ search: payload, carId: currentCar.id });
      this.router.navigate(['/create-account'], { queryParams: { redirect: this.router.url } });
      return;
    }

    const user = this.auth.getCurrentUser();
    if (!user) return;

    this.searchState.setReservationContext({ search: payload, carId: currentCar.id });
    firstValueFrom(
      this.reservationService.createReservation({
        userId: user.id,
        car: currentCar,
        search: payload
      })
    ).then((result) => {
      if (result.success) {
        this.userService.addReservation(user.id, result.reservation.id);
        this.router.navigate(['/mes-reservations']);
        return;
      }

      if (result.reason === 'conflict') {
        this.reservationError =
          'Cette voiture n\'est pas disponible pour ces dates. Veuillez choisir une autre période.';
      }
    });
  }
}
