import { Injectable, Signal, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, map } from 'rxjs';
import { Reservation } from '../models/reservation';
import { Car } from '../models/car';
import { SearchPayload } from './search-state.service';

export interface CreateReservationPayload {
  userId: number;
  car: Car;
  search: SearchPayload;
}

export interface CreateReservationSuccessResult {
  success: true;
  reservation: Reservation;
}

export interface CreateReservationConflictResult {
  success: false;
  reason: 'conflict';
}

export type CreateReservationResult =
  | CreateReservationSuccessResult
  | CreateReservationConflictResult;

export type ReservationPayload = Omit<Reservation, 'id'>;

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/reservations';
  private reservationsSignal = signal<Reservation[]>([]);

  constructor() {
    this.loadReservations().subscribe();
  }

  get reservations(): Signal<Reservation[]> {
    return this.reservationsSignal.asReadonly();
  }

  loadReservations(): Observable<Reservation[]> {
    return this.http
      .get<Reservation[]>(this.baseUrl)
      .pipe(tap((reservations) => this.reservationsSignal.set(reservations)));
  }

  hasConflict(carId: number, startDate: string | Date, endDate: string | Date): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.reservationsSignal().some((reservation) => {
      if (reservation.carId !== carId) return false;
      const existingStart = new Date(reservation.startDate);
      const existingEnd = new Date(reservation.endDate);
      return existingStart <= end && start <= existingEnd;
    });
  }

  createReservation(payload: CreateReservationPayload): Observable<CreateReservationResult> {
    const { car, search } = payload;
    if (this.hasConflict(car.id, search.startDate, search.endDate)) {
      return of({ success: false, reason: 'conflict' } as CreateReservationConflictResult);
    }

    const durationDays = this.calculateDuration(payload.search.startDate, payload.search.endDate);
    const reservation: ReservationPayload = {
      userId: payload.userId,
      carId: payload.car.id,
      startDate: payload.search.startDate,
      endDate: payload.search.endDate,
      totalPrice: durationDays * (payload.car.pricePerDay ?? 0),
      status: 'pending',
      pickUpLocation: payload.search.pickupLocation,
      dropOffLocation: payload.search.returnLocation,
      pricePerDay: payload.car.pricePerDay
    };

    return this.http.post<Reservation>(this.baseUrl, reservation).pipe(
      tap((created) => this.reservationsSignal.update((list) => [...list, created])),
      map((created): CreateReservationSuccessResult => ({ success: true, reservation: created }))
    );
  }

  getReservations(): Reservation[] {
    return this.reservationsSignal();
  }

  getReservationById(id: number): Reservation | undefined {
    return this.reservationsSignal().find((res) => res.id === id);
  }

  getByUser(userId: number): Observable<Reservation[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<Reservation[]>(this.baseUrl, { params });
  }

  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.reservationsSignal.update((list) => list.filter((res) => res.id !== id)))
    );
  }

  private calculateDuration(startDate: string | Date, endDate: string | Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / millisecondsPerDay));
    return diff;
  }
}
