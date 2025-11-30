import { UserRole } from './user-role';

export interface User {
  id: number;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
  username?: string;
  favoriteCars?: number[];
  reservations?: number[];
}
