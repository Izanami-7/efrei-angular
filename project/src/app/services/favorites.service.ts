import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Favorite } from '../models/favorite';

export type CreateFavoritePayload = Omit<Favorite, 'id'>;

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/favorites';

  getFavoritesByUser(userId: number): Observable<Favorite[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<Favorite[]>(this.baseUrl, { params });
  }

  addFavorite(payload: CreateFavoritePayload): Observable<Favorite> {
    return this.http.post<Favorite>(this.baseUrl, payload);
  }

  removeFavorite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
