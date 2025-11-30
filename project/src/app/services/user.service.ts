import { Injectable, Signal, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { User } from '../models/user';

export type CreateUserPayload = Omit<User, 'id'>;
export type UpdateUserPayload = Partial<Omit<User, 'id'>>;

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/users';
  private usersSignal = signal<User[]>([]);

  constructor() {
    this.loadUsers().subscribe();
  }

  get users(): Signal<User[]> {
    return this.usersSignal.asReadonly();
  }

  loadUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl).pipe(tap((users) => this.usersSignal.set(users)));
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  getCachedUserById(id: number | undefined): User | undefined {
    if (!id) return undefined;
    return this.usersSignal().find((user) => user.id === id);
  }

  getUserByEmail(email: string): Observable<User[]> {
    const params = new HttpParams().set('email', email);
    return this.http.get<User[]>(this.baseUrl, { params });
  }

  getById(id: number | undefined): User | undefined {
    return this.getCachedUserById(id);
  }

  upsertCachedUser(user: User): void {
    this.usersSignal.update((users) => {
      const index = users.findIndex((u) => u.id === user.id);
      if (index === -1) {
        return [...users, user];
      }

      const updated = [...users];
      updated[index] = user;
      return updated;
    });
  }

  toggleFavorite(userId: number, carId: number): void {
    const user = this.getCachedUserById(userId);
    if (!user) {
      console.error(`[UserService] User ${userId} not found in cache when toggling favorite.`);
      this.getUserById(userId).subscribe({
        next: (fetched) => {
          this.usersSignal.update((users) => {
            const exists = users.some((u) => u.id === fetched.id);
            return exists ? users : [...users, fetched];
          });
          this.applyFavoriteUpdate(fetched, carId);
        },
        error: (error) => console.error('[UserService] Failed to fetch user before toggling favorite', error)
      });
      return;
    }

    this.applyFavoriteUpdate(user, carId);
  }

  addReservation(userId: number, reservationId: number): void {
    const user = this.getCachedUserById(userId);
    if (!user) return;
    const reservations = user.reservations ?? [];
    const updated = [...reservations, reservationId];
    this.updateUser(userId, { reservations: updated }).subscribe();
  }

  removeReservation(userId: number, reservationId: number): void {
    const user = this.getCachedUserById(userId);
    if (!user) return;
    const reservations = user.reservations ?? [];
    const updated = reservations.filter((id) => id !== reservationId);
    this.updateUser(userId, { reservations: updated }).subscribe();
  }

  findByCredentials(identifier: string, password: string): Observable<User | undefined> {
    const params = new HttpParams().set('email', identifier);
    return this.http.get<User[]>(this.baseUrl, { params }).pipe(
      map((users) => users.find((u) => u.password === password))
    );
  }

  createUser(payload: CreateUserPayload): Observable<User> {
    return this.http.post<User>(this.baseUrl, payload).pipe(
      tap((created) => this.usersSignal.update((users) => [...users, created]))
    );
  }

  updateUser(id: number, payload: UpdateUserPayload): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}`, payload).pipe(
      tap((updated) =>
        this.usersSignal.update((users) => users.map((user) => (user.id === updated.id ? updated : user)))
      )
    );
  }

  private applyFavoriteUpdate(user: User, carId: number): void {
    const favorites = user.favoriteCars ?? [];
    const updatedFavorites = favorites.includes(carId)
      ? favorites.filter((id) => id !== carId)
      : [...favorites, carId];

    this.updateUser(user.id, { favoriteCars: updatedFavorites }).subscribe({
      next: (updatedUser) => console.log('[UserService] Favorites updated', updatedUser.favoriteCars),
      error: (error) => console.error('[UserService] Failed to update favorites', error)
    });
  }
}
