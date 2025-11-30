export interface Reservation {
  id: number;
  userId: number;
  carId: number;
  startDate: string | Date;
  endDate: string | Date;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  pickUpLocation?: string;
  dropOffLocation?: string;
  pricePerDay?: number;
}
