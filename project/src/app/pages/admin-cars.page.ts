import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarService } from '../services/car.service';
import { Car } from '../models/car';

@Component({
  selector: 'app-admin-cars-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <h1>Administration - Cars</h1>
      <form [formGroup]="form" (ngSubmit)="save()" class="card">
        <div class="grid">
          <label>Brand<input formControlName="brand" /></label>
          <label>Model<input formControlName="model" /></label>
          <label>Color<input formControlName="color" /></label>
          <label>Year<input type="number" formControlName="releaseYear" /></label>
          <label>Transmission
            <select formControlName="transmission">
              <option value="manuelle">Manual</option>
              <option value="automatique">Automatic</option>
            </select>
          </label>
          <label>Price / day (€)<input type="number" formControlName="pricePerDay" /></label>
        </div>
        <label>Description<textarea formControlName="description"></textarea></label>
        <button type="submit" [disabled]="form.invalid">Add</button>
      </form>

      <div class="grid">
        <article class="card" *ngFor="let car of carService.cars()">
          <h3>{{ car.brand }} {{ car.model }}</h3>
          <p>{{ car.color }} · {{ car.releaseYear }} · {{ car.transmission }}</p>
          <p><strong>{{ car.pricePerDay | currency: 'EUR' }}</strong> / day</p>
          <p>{{ car.description }}</p>
          <button class="danger" (click)="delete(car.id)">Remove</button>
        </article>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        border: 1px solid #ddd;
        padding: 1rem;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.5rem;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }
      input,
      select,
      textarea {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      button {
        background-color: #0c8b2f;
        color: #fff;
        border: none;
        padding: 0.6rem 1rem;
        border-radius: 4px;
        cursor: pointer;
      }
      button.danger {
        background-color: #c0392b;
      }
    `
  ]
})
export class AdminCarsPage {
  private fb = inject(FormBuilder);
  carService = inject(CarService);

  form = this.fb.group({
    brand: ['', Validators.required],
    model: ['', Validators.required],
    color: ['', Validators.required],
    releaseYear: [new Date().getFullYear(), Validators.required],
    transmission: ['manuelle', Validators.required],
    description: ['', Validators.required],
    pricePerDay: [50, Validators.required]
  });

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue() as Omit<Car, 'id'>;
    this.carService.addCar(value).subscribe();
    this.form.reset({
      brand: '',
      model: '',
      color: '',
      releaseYear: new Date().getFullYear(),
      transmission: 'manuelle',
      description: '',
      pricePerDay: 50
    });
  }

  delete(id: number): void {
    this.carService.deleteCar(id);
  }
}
