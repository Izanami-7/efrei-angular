import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ReservationService } from '../services/reservation.service';
import { CarService } from '../services/car.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { Reservation } from '../models/reservation';
import { Car } from '../models/car';
import { ReservationContext, SearchPayload, SearchStateService } from '../services/search-state.service';

interface ReservationView extends Reservation {
  totalDays: number;
  carImage?: string;
  carBrand?: string;
  carModel?: string;
  carColor?: string;
  carReleaseYear?: number;
  carTransmission?: string;
}

type ReservationFilters = {
  brand: string | null;
  color: string | null;
  releaseYear: string | null;
  transmission: string | null;
  startDate: string | null;
};

@Component({
  selector: 'app-reservations-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <h1>My reservations</h1>
      <div *ngIf="reservationIntent as intent" class="intent">
        <p class="intent__title">Préparation de réservation</p>
        <div class="intent__chips">
          <span class="chip">{{ intent.search.pickupLocation }} → {{ intent.search.returnLocation }}</span>
          <span class="chip">
            {{ intent.search.startDate | date: 'mediumDate' }} → {{ intent.search.endDate | date: 'mediumDate' }}
          </span>
          <span *ngIf="intent.car" class="chip">{{ intent.car.brand }} {{ intent.car.model }}</span>
        </div>
      </div>
      <ng-container *ngIf="auth.isLoggedIn(); else needLogin">
        <form [formGroup]="form" class="filters">
          <input type="text" placeholder="Brand" formControlName="brand" />
          <input type="text" placeholder="Color" formControlName="color" />
          <input type="number" placeholder="Year" formControlName="releaseYear" />
          <select formControlName="transmission">
            <option value="">Transmission</option>
            <option value="manuelle">Manual</option>
            <option value="automatique">Automatic</option>
          </select>
          <input type="date" formControlName="startDate" />
        </form>
        <div *ngIf="filtered().length; else noResa" class="list">
          <article class="card" *ngFor="let reservation of filtered()">
            <img
              class="car-image"
              [src]="reservation.carImage || fallbackImage"
              [alt]="reservation.carBrand + ' ' + reservation.carModel"
            />
            <div class="card-content">
              <h3>{{ reservation.carBrand }} {{ reservation.carModel }}</h3>
              <p *ngIf="reservation.carColor || reservation.carReleaseYear || reservation.carTransmission">
                <span *ngIf="reservation.carColor">{{ reservation.carColor }}</span>
                <span *ngIf="reservation.carReleaseYear"> · {{ reservation.carReleaseYear }}</span>
                <span *ngIf="reservation.carTransmission"> · {{ reservation.carTransmission }}</span>
              </p>
              <p>Withdrawal : {{ reservation.pickUpLocation }}</p>
              <p>Restitution : {{ reservation.dropOffLocation }}</p>
              <p>Of {{ reservation.startDate | date }} au {{ reservation.endDate | date }}</p>
              <p>Price : {{ reservation.pricePerDay | currency: 'EUR' }} / jour</p>
              <p>Total price : {{ reservation.totalPrice | currency: 'EUR' }} ({{ reservation.totalDays }} jours)</p>
              <div class="actions">
                <a [routerLink]="['/cars', reservation.carId]">See the file</a>
                <button (click)="cancel(reservation.id)">Cancel</button>
              </div>
            </div>
          </article>
        </div>
        <ng-template #noResa><p>You do not have a reservation yet.</p></ng-template>
      </ng-container>
      <ng-template #needLogin>
        <p>Log in to access your bookings.</p>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .filters {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      input,
      select {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      .list {
        display: grid;
        gap: 1rem;
      }
      .intent {
        margin: 1rem 0;
        padding: 1rem;
        border: 1px solid #ff5f00;
        border-radius: 12px;
        background: #fff8f3;
      }
      .intent__title {
        font-weight: 700;
        color: #b54700;
        margin-bottom: 0.5rem;
      }
      .intent__chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.35rem 0.7rem;
        background: #fff;
        border: 1px solid #ffd7bf;
        border-radius: 999px;
        font-size: 0.9rem;
        color: #8a3a00;
      }
      .card {
        border: 1px solid #ddd;
        padding: 1rem;
        border-radius: 8px;
        display: grid;
        grid-template-columns: 140px 1fr;
        gap: 1rem;
        align-items: center;
      }
      .car-image {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: 6px;
      }
      .card-content {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }
      .actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      button {
        background-color: #c0392b;
        color: #fff;
        border: none;
        padding: 0.5rem 0.8rem;
        border-radius: 4px;
        cursor: pointer;
      }
    `
  ]
})
export class ReservationsPage {
  private reservationService = inject(ReservationService);
  private carService = inject(CarService);
  readonly auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private searchState = inject(SearchStateService);
  private router = inject(Router);

  fallbackImage = 'https://via.placeholder.com/320x180?text=Voiture';

  form = this.fb.group({
    brand: [''],
    color: [''],
    releaseYear: [''],
    transmission: [''],
    startDate: ['']
  });

  reservationIntent: (ReservationContext & { car?: Car }) | null = this.resolveReservationIntent();

  reservationsView = computed<ReservationView[]>(() => {
    const user = this.auth.getCurrentUser();
    if (!user) return [];

    return this.reservationService
      .reservations()
      .filter((reservation) => reservation.userId === user.id)
      .map((reservation) => {
        const car = this.carService.getCarById(reservation.carId);
        return {
          ...reservation,
          carImage: car?.imageUrl,
          carBrand: car?.brand,
          carModel: car?.model,
          carColor: car?.color,
          carReleaseYear: car?.releaseYear,
          carTransmission: car?.transmission,
          totalDays: this.calculateDuration(reservation.startDate, reservation.endDate)
        };
      });
  });

  filtered(): ReservationView[] {
    return this.applyFilters(this.reservationsView(), this.form.getRawValue());
  }

  cancel(id: number): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    this.reservationService.deleteReservation(id).subscribe({
      next: () => {
        this.userService.removeReservation(user.id, id);
      },
      error: (error) => console.error('[ReservationsPage] Failed to cancel reservation', error)
    });
  }

  private applyFilters(items: ReservationView[], filters: ReservationFilters): ReservationView[] {
    const brandFilter = filters.brand?.toLowerCase() ?? '';
    const colorFilter = filters.color?.toLowerCase() ?? '';
    const releaseYearFilter = filters.releaseYear ? Number(filters.releaseYear) : null;
    const transmissionFilter = filters.transmission ?? '';
    const startDateFilter = filters.startDate ?? '';

    return items.filter((item) => {
      const matchesBrand =
        !brandFilter ||
        (item.carBrand ?? '').toLowerCase().includes(brandFilter) ||
        (item.carModel ?? '').toLowerCase().includes(brandFilter);
      const matchesColor =
        !colorFilter || (!!item.carColor && item.carColor.toLowerCase().includes(colorFilter));
      const matchesYear = releaseYearFilter === null || item.carReleaseYear === releaseYearFilter;
      const matchesTrans = !transmissionFilter || item.carTransmission === transmissionFilter;
      const matchesDate = !startDateFilter || new Date(item.startDate).toISOString().startsWith(startDateFilter);
      return matchesBrand && matchesColor && matchesYear && matchesTrans && matchesDate;
    });
  }

  private calculateDuration(start: string | Date, end: string | Date): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / millisecondsPerDay));
  }

  private resolveReservationIntent(): (ReservationContext & { car?: Car }) | null {
    const navigationState = this.router.getCurrentNavigation()?.extras.state as
      | { search?: SearchPayload; carId?: number }
      | undefined;

    const storedContext = this.searchState.getReservationContext();
    const search = navigationState?.search ?? storedContext?.search ?? this.searchState.getSearchPayload();

    if (!search) {
      return null;
    }

    const carId = navigationState?.carId ?? storedContext?.carId;

    this.searchState.setSearchPayload(search);
    this.searchState.setReservationContext({ search, carId });

    return {
      search,
      carId,
      car: carId ? this.carService.getCarById(carId) ?? undefined : undefined
    };
  }
}
