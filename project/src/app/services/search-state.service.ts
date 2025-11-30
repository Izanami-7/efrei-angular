import { Injectable } from '@angular/core';

export interface SearchPayload {
  pickupLocation: string;
  returnLocation: string;
  startDate: string;
  endDate: string;
}

export interface ReservationContext {
  search: SearchPayload;
  carId?: number;
}

@Injectable({ providedIn: 'root' })
export class SearchStateService {
  private searchPayload: SearchPayload | null = null;
  private reservationContext: ReservationContext | null = null;

  getSearchPayload(): SearchPayload | null {
    return this.searchPayload ? { ...this.searchPayload } : null;
  }

  setSearchPayload(payload: SearchPayload): void {
    this.searchPayload = { ...payload };
  }

  clearSearchPayload(): void {
    this.searchPayload = null;
    this.reservationContext = null;
  }

  setReservationContext(context: ReservationContext): void {
    this.reservationContext = {
      ...context,
      search: { ...context.search }
    };
  }

  getReservationContext(): ReservationContext | null {
    return this.reservationContext
      ? {
          ...this.reservationContext,
          search: { ...this.reservationContext.search }
        }
      : null;
  }
}
