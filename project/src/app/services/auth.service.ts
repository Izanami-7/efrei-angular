import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UserService } from './user.service';
import { User } from '../models/user';
import { UserRole } from '../models/user-role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserIdSignal = signal<number | null>(this.loadStoredUserId());

  constructor(private userService: UserService, private router: Router) {}

  readonly currentUser = computed<User | undefined>(() =>
    this.userService.getById(this.currentUserIdSignal() ?? undefined)
  );

  async login(identifier: string, password: string): Promise<boolean> {
    const user = await firstValueFrom(this.userService.findByCredentials(identifier, password));
    if (user) {
      this.userService.upsertCachedUser(user);
      this.currentUserIdSignal.set(user.id);
      localStorage.setItem('currentUserId', user.id.toString());
      return true;
    }
    return false;
  }

  async register(email: string, username: string, password: string): Promise<User> {
    const now = new Date().toISOString();
    const newUser = await firstValueFrom(
      this.userService.createUser({
        email,
        username,
        password,
        favoriteCars: [],
        reservations: [],
        role: 'client',
        firstName: username,
        lastName: '',
        phone: '',
        createdAt: now
      })
    );
    this.currentUserIdSignal.set(newUser.id);
    localStorage.setItem('currentUserId', newUser.id.toString());
    return newUser;
  }

  logout(): void {
    this.currentUserIdSignal.set(null);
    localStorage.removeItem('currentUserId');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  getUserRole(): UserRole | null {
    return this.currentUser()?.role ?? null;
  }

  getCurrentUser(): User | undefined {
    const user = this.currentUser();
    console.log('[AuthService] Current user resolved', user);
    return user;
  }

  private loadStoredUserId(): number | null {
    const stored = localStorage.getItem('currentUserId');
    return stored ? Number(stored) : null;
  }
}
