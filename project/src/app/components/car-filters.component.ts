import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Car } from '../models/car';

export interface CarFilters {
  brand: string;
  color: string;
  releaseYear: string;
  transmission: string;
}

@Component({
  selector: 'app-car-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form
      [formGroup]="form"
      class="grid gap-4 rounded-2xl bg-white p-6 shadow-lg shadow-black/5 ring-1 ring-slate-100 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
      (ngSubmit)="applyFilters()"
    >
      <div class="flex flex-col gap-2">
        <label for="brand" class="text-sm font-semibold text-neutral-800">Brand</label>
        <input
          id="brand"
          type="text"
          formControlName="brand"
          placeholder="BMW, Audi..."
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-neutral-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label for="color" class="text-sm font-semibold text-neutral-800">Color</label>
        <input
          id="color"
          type="text"
          formControlName="color"
          placeholder="Black, White..."
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-neutral-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label for="year" class="text-sm font-semibold text-neutral-800">Year</label>
        <input
          id="year"
          type="number"
          formControlName="releaseYear"
          placeholder="2024"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-neutral-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label for="transmission" class="text-sm font-semibold text-neutral-800">Transmission</label>
        <select
          id="transmission"
          formControlName="transmission"
          class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-neutral-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        >
          <option value="">Any</option>
          <option value="manuelle">Manual</option>
          <option value="automatique">Automatic</option>
        </select>
      </div>
      <div class="flex flex-wrap gap-3 lg:justify-end">
        <button
          type="submit"
          class="inline-flex items-center justify-center rounded-full bg-[#ff5f00] px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-md shadow-orange-500/30 transition hover:-translate-y-0.5 hover:shadow-orange-500/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
          Filter
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-neutral-800 transition hover:-translate-y-0.5 hover:border-neutral-900 hover:text-neutral-900"
          (click)="resetFilters()"
        >
          Reset
        </button>
      </div>
    </form>
  `
})
export class CarFiltersComponent {
  @Input() cars: Car[] | null = [];
  @Output() filtersChanged = new EventEmitter<CarFilters>();

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group<CarFilters>({
    brand: '',
    color: '',
    releaseYear: '',
    transmission: ''
  });

  applyFilters(): void {
    this.filtersChanged.emit(this.form.getRawValue());
  }

  resetFilters(): void {
    this.form.reset({ brand: '', color: '', releaseYear: '', transmission: '' });
    this.applyFilters();
  }
}
