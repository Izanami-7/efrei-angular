import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../services/reservation.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { CarService } from '../services/car.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-reservation-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <h1>Réserver une voiture</h1>
      <form [formGroup]="form" (ngSubmit)="submit()" class="card">
        <p *ngIf="car" class="price">Tarif : {{ car.pricePerDay | currency: 'EUR' }} / jour</p>
        <label>
          Lieu de retrait
          <select formControlName="pickUpLocation">
            <option value="" disabled>Choisir un lieu</option>
            <option *ngFor="let location of locations" [value]="location">{{ location }}</option>
          </select>
        </label>
        <label>
          Lieu de restitution
          <select formControlName="dropOffLocation">
            <option value="" disabled>Choisir un lieu</option>
            <option *ngFor="let location of locations" [value]="location">{{ location }}</option>
          </select>
        </label>
        <label>
          Date de début
          <input type="date" formControlName="startDate" [attr.min]="today" />
          <small class="error" *ngIf="form.get('startDate')?.hasError('minDate')">
            La date de début doit être postérieure ou égale à aujourd'hui.
          </small>
        </label>
        <label>
          Date de fin
          <input
            type="date"
            formControlName="endDate"
            [attr.min]="form.get('startDate')?.value || today"
          />
        </label>
        <small class="error" *ngIf="form.hasError('endBeforeStart')">
          La date de fin doit être postérieure ou égale à la date de début.
        </small>
        <p *ngIf="totalPrice !== null" class="price total">
          Prix total estimé : {{ totalPrice | currency: 'EUR' }}
        </p>
        <p *ngIf="reservationError" class="error">{{ reservationError }}</p>
        <button type="submit" [disabled]="form.invalid">Valider</button>
      </form>
    </div>
  `,
  styles: [
    `
      .card {
        border: 1px solid #ddd;
        padding: 1rem;
        border-radius: 8px;
        max-width: 400px;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        font-weight: 600;
      }
      input,
      select {
        padding: 0.6rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      .price {
        font-weight: 600;
        margin: 0.4rem 0;
      }
      .total {
        color: #0c8b2f;
      }
      .error {
        color: #c0392b;
      }
      button {
        margin-top: 1rem;
        padding: 0.7rem 1rem;
        background-color: #0066cc;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    `
  ]
})
export class ReservationFormPage {
  private fb = inject(FormBuilder);
  private reservationService = inject(ReservationService);
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private carService = inject(CarService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private carId = Number(this.route.snapshot.paramMap.get('carId'));

  readonly locations = [
    '10 Rue de Rivoli, 75001 Paris',
    '45 Avenue Jean Médecin, 06000 Nice',
    '5 Place Bellecour, 69002 Lyon',
    '12 Quai des Chartrons, 33000 Bordeaux',
    '18 Rue Sainte-Catherine, 33000 Bordeaux'
  ];

  car = this.carService.getCarById(this.carId);
  today = this.getTodayString();
  reservationError: string | null = null;

  private minTodayValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value; // value is "YYYY-MM-DD"
    if (!value) return null;

    // Get today's date in local YYYY-MM-DD format
    const now = new Date();
    const todayString = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];

    // Simple string comparison works perfectly for ISO dates
    // "2025-11-03" < "2025-11-30" is TRUE, so it returns an error
    return value < todayString ? { minDate: true } : null;
  };

  private endAfterStartValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    if (!start || !end) return null;
    const startDate = this.toLocalStartOfDay(start);
    const endDate = this.toLocalStartOfDay(end);
    return endDate < startDate ? { endBeforeStart: true } : null;
  };

  form = this.fb.group({
    startDate: ['', [Validators.required, this.minTodayValidator]],
    endDate: ['', Validators.required],
    pickUpLocation: ['', Validators.required],
    dropOffLocation: ['', Validators.required]
  }, { validators: this.endAfterStartValidator });

  async submit(): Promise<void> {
    this.reservationError = null;
    const user = this.auth.getCurrentUser();
    if (!user || this.form.invalid || !this.car) return;
    const { startDate, endDate, pickUpLocation, dropOffLocation } = this.form.getRawValue();
    if (startDate && endDate && pickUpLocation && dropOffLocation) {
      const result = await firstValueFrom(
        this.reservationService.createReservation({
          userId: user.id,
          car: this.car,
          search: {
            pickupLocation: pickUpLocation,
            returnLocation: dropOffLocation,
            startDate,
            endDate
          }
        })
      );
      if (result.success) {
        this.userService.addReservation(user.id, result.reservation.id);
        this.router.navigate(['/mes-reservations']);
        return;
      }

      if (result.reason === 'conflict') {
        this.reservationError =
          "Cette voiture n'est pas disponible pour ces dates. Veuillez sélectionner une autre période.";
      }
    }
  }

  get totalPrice(): number | null {
    return this.calculateTotalPrice();
  }

  private calculateTotalPrice(): number | null {
    if (!this.car) return null;
    const { startDate, endDate } = this.form.getRawValue();
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / millisecondsPerDay));
    return diff * this.car.pricePerDay;
  }

  private toLocalStartOfDay(value: string | Date): Date {
    const base = typeof value === 'string' ? new Date(`${value}T00:00:00`) : new Date(value);
    base.setHours(0, 0, 0, 0);
    return base;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getTodayString(): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.formatDate(today);
  }
}
