import { Routes } from '@angular/router';
import { LoginPage } from './pages/login.page';
import { RegisterPage } from './pages/register.page';
import { CarListPage } from './pages/car-list.page';
import { CarDetailPage } from './pages/car-detail.page';
import { ReservationFormPage } from './pages/reservation-form.page';
import { FavoritesPage } from './pages/favorites.page';
import { ReservationsPage } from './pages/reservations.page';
import { AccountPage } from './pages/account.page';
import { AdminCarsPage } from './pages/admin-cars.page';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { LandingPage } from './pages/landing.page';
import { VanListPage } from './pages/van-list.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: LandingPage },
  { path: 'cars', component: CarListPage },
  { path: 'cars/:id', component: CarDetailPage },
  { path: 'vans', component: VanListPage },
  { path: 'van', pathMatch: 'full', redirectTo: 'vans' },
  { path: 'voitures', pathMatch: 'full', redirectTo: 'cars' },
  { path: 'voitures/:id', redirectTo: 'cars/:id' },
  { path: 'login', component: LoginPage },
  { path: 'create-account', component: RegisterPage },
  { path: 'inscription', component: RegisterPage },
  { path: 'reserver/:carId', component: ReservationFormPage, canActivate: [authGuard] },
  { path: 'mes-favoris', component: FavoritesPage, canActivate: [authGuard] },
  { path: 'mes-reservations', component: ReservationsPage, canActivate: [authGuard] },
  { path: 'mon-compte', component: AccountPage, canActivate: [authGuard] },
  { path: 'admin/voitures', component: AdminCarsPage, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: '' }
];
