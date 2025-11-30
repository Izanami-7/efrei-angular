export interface Car {
  id: number;
  brand: string;
  model: string;
  category?: 'car' | 'van';
  type?: 'car' | 'van';
  color?: string;
  releaseYear?: number;
  transmission: 'manual' | 'automatic' | 'manuelle' | 'automatique';
  fuel?: string;
  fuelType?: string;
  seats?: number;
  description: string;
  pricePerDay: number;
  imageUrl?: string;
  available?: boolean;
}
