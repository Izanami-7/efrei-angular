import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { Car } from '../models/car';

export type CreateCarPayload = Omit<Car, 'id'>;

@Injectable({ providedIn: 'root' })
export class CarService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/cars';
  private carsSignal = signal<Car[]>([]);

  constructor() {
    this.loadCars().subscribe();
  }

  get cars(): Signal<Car[]> {
    return this.carsSignal.asReadonly();
  }

  loadCars(): Observable<Car[]> {
    return this.http.get<Car[]>(this.baseUrl).pipe(
      tap((cars) => {
        this.carsSignal.set(cars);
        console.log('[CarService] Cars loaded from API', cars);
      }),
      catchError((error) => {
        console.error('[CarService] Failed to load cars', error);
        this.carsSignal.set([]);
        return of([] as Car[]);
      })
    );
  }

  getCars(): Observable<Car[]> {
    return this.http.get<Car[]>(this.baseUrl);
  }

  fetchCarById(id: number): Observable<Car> {
    return this.http.get<Car>(`${this.baseUrl}/${id}`);
  }

  getCarById(id: number): Car | undefined {
    return this.carsSignal().find((car) => car.id === id);
  }

  createCar(car: CreateCarPayload): Observable<Car> {
    return this.http.post<Car>(this.baseUrl, car).pipe(
      tap((created) => this.carsSignal.update((cars) => [...cars, created]))
    );
  }

  addCar(car: CreateCarPayload): Observable<Car> {
    return this.createCar(car);
  }

  updateCar(car: Car): Observable<Car> {
    return this.http.put<Car>(`${this.baseUrl}/${car.id}`, car).pipe(
      tap((updated) =>
        this.carsSignal.update((cars) => cars.map((c) => (c.id === updated.id ? updated : c)))
      )
    );
  }

  deleteCar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.carsSignal.update((cars) => cars.filter((car) => car.id !== id)))
    );
  }

  availableCars = computed(() => this.carsSignal().filter((car) => car.available !== false));
}
