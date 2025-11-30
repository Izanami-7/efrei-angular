import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Car } from '../models/car';
import { PricePerDayPipe } from '../pipes/price-per-day.pipe';
import { HighlightDirective } from '../directives/highlight.directive';

@Component({
  selector: 'app-car-card',
  standalone: true,
  imports: [CommonModule, RouterLink, PricePerDayPipe, HighlightDirective],
  template: `
    <article
      class="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/10 ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-2xl"
    >
      <div class="relative overflow-hidden">
        <img
          [src]="car.imageUrl || fallbackImage"
          [alt]="car.brand + ' ' + car.model"
          class="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100"></div>
        <div class="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-600">
          {{ car.brand }}
        </div>
      </div>
      <div class="flex flex-1 flex-col gap-3 p-5">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="text-lg font-bold text-neutral-900">{{ car.brand }} {{ car.model }}</h3>
            <p class="text-sm text-slate-500">{{ car.color }} · {{ car.releaseYear }} · {{ car.transmission }}</p>
          </div>
          <div class="flex flex-col items-end text-right">
            <span class="text-xs uppercase tracking-[0.2em] text-slate-400">from</span>
            <p class="text-xl font-bold text-neutral-900" [appHighlight]="car.pricePerDay">
              {{ car.pricePerDay | pricePerDay }}
            </p>
            <span class="text-xs font-semibold text-slate-500">Standard currency</span>
          </div>
        </div>
        <p class="text-sm text-slate-600">{{ car.description }}</p>
        <div class="mt-auto flex flex-wrap gap-3">
          <a
            [routerLink]="['/cars', car.id]"
            class="inline-flex flex-1 items-center justify-center rounded-full border border-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:-translate-y-0.5 hover:border-orange-500 hover:text-orange-600"
          >
            View details
          </a>
          <button
            type="button"
            [disabled]="!isLoggedIn"
            (click)="toggleFavorite.emit()"
            class="inline-flex flex-1 items-center justify-center rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ isFavorite ? 'Remove favorite' : 'Add to favorites' }}
          </button>
        </div>
      </div>
    </article>
  `
})
export class CarCardComponent {
  @Input() car!: Car;
  @Input() isFavorite = false;
  @Input() isLoggedIn = false;
  @Output() toggleFavorite = new EventEmitter<void>();

  fallbackImage = 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1000&q=80';
}
