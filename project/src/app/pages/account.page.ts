import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page mx-auto max-w-3xl space-y-4 bg-neutral-950 px-4 py-6 text-slate-100">
      <h1 class="text-2xl font-semibold text-white">My account</h1>

      <ng-container *ngIf="user(); else notConnected">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-sm">
            <h2 class="text-lg font-semibold text-white">Informations</h2>
            <div class="mt-3 space-y-2">
              <div>
                <p class="text-sm text-slate-400">Email</p>
                <p class="text-base font-medium text-white">{{ user()?.email }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-400">Username</p>
                <p class="text-base font-medium text-white">{{ user()?.username }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-400">Role</p>
                <p class="text-base font-medium capitalize text-white">{{ user()?.role }}</p>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-sm">
            <h2 class="text-lg font-semibold text-white">Stats</h2>
            <div class="mt-3 space-y-2 text-slate-400">
              <p>
                Favorite cars :
                <strong class="text-white">{{ user()?.favoriteCars?.length ?? 0 }}</strong>
              </p>
              <p>
                Reservations :
                <strong class="text-white">{{ user()?.reservations?.length ?? 0 }}</strong>
              </p>
            </div>
            <div class="mt-4 flex flex-wrap gap-3">
              <a routerLink="/mes-favoris" class="text-sm font-medium text-orange-400 hover:text-orange-300 hover:underline">See my favorites</a>
              <a routerLink="/mes-reservations" class="text-sm font-medium text-orange-400 hover:text-orange-300 hover:underline">See my reservations</a>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-sm">
          <h2 class="mb-4 text-lg font-semibold text-white">Modify my profil</h2>

          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="grid gap-4 md:grid-cols-2">
            <label class="block">
              <span class="text-sm font-medium text-slate-400">Name</span>
              <input
                type="text"
                formControlName="firstName"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-neutral-900 bg-white p-2 border"
              />
            </label>
            <label class="block">
              <span class="text-sm font-medium text-slate-400">Surname</span>
              <input
                type="text"
                formControlName="lastName"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-neutral-900 bg-white p-2 border"
              />
            </label>
            <label class="block md:col-span-2">
              <span class="text-sm font-medium text-slate-400">Phone</span>
              <input
                type="tel"
                formControlName="phone"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-neutral-900 bg-white p-2 border"
              />
            </label>

            <div class="md:col-span-2 flex items-center gap-4">
              <button
                type="submit"
                [disabled]="profileForm.invalid || profileForm.pristine"
                class="rounded-full bg-green-600 px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
              <span *ngIf="successMessage" class="text-sm text-green-600 font-medium animate-pulse">
                {{ successMessage }}
              </span>
            </div>
          </form>
        </div>

      </ng-container>

      <ng-template #notConnected>
        <p class="mt-10 text-center text-slate-400">Connect to see your account.</p>
      </ng-template>
    </div>
  `,
  styles: []
})
export class AccountPage {
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  user = this.auth.currentUser;
  successMessage = '';
  profileForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: ['']
  });

  constructor() {
    effect(() => {
      const currentUser = this.user();
      if (!currentUser) return;

      this.profileForm.patchValue(
        {
          firstName: currentUser.firstName ?? '',
          lastName: currentUser.lastName ?? '',
          phone: currentUser.phone ?? ''
        },
        { emitEvent: false }
      );
    });
  }

  saveProfile(): void {
    const currentUser = this.user();
    if (!currentUser) return;
    
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const formValues = this.profileForm.getRawValue();

    this.userService.updateUser(currentUser.id, formValues).subscribe({
      next: (updatedUser) => {
        this.successMessage = 'Profil up to date';
        this.userService.upsertCachedUser(updatedUser);
                setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => console.error('Failed to update profile', err)
    });
  }
}
