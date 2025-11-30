import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { Router } from '@angular/router';
import { SearchPayload, SearchStateService } from '../services/search-state.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <label
          class="group relative flex flex-col rounded-xl border border-transparent bg-slate-50/80 p-4 shadow-inner transition hover:-translate-y-0.5 hover:border-orange-400/70 hover:shadow-md"
        >
          <span class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            <svg class="h-4 w-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m21 21-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
              />
            </svg>
            Pickup location
          </span>
          <input
            type="text"
            formControlName="pickupLocation"
            placeholder="City, airport or address"
            (focus)="openPickupDropdown()"
            (input)="openPickupDropdown()"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-neutral-900 ring-2 ring-transparent transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-orange-100"
          />
          <div
            *ngIf="isPickupDropdownOpen"
            class="absolute left-0 right-0 top-full z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-orange-500/10"
          >
            <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Popular pickups
              <span class="text-[10px] font-bold text-orange-500"> Lowcation </span>
            </div>
            <ul class="divide-y divide-slate-100">
              <li
                *ngFor="let location of pickupSuggestions"
                class="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm text-neutral-900 transition hover:bg-orange-50"
                (click)="selectLocation('pickupLocation', location.name)"
              >
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/10 text-orange-600">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 21s-6-5.686-6-10.25A6.25 6.25 0 0 1 12 4.5a6.25 6.25 0 0 1 6 6.25C18 15.314 12 21 12 21Z"
                    />
                    <circle cx="12" cy="10.75" r="1.5" />
                  </svg>
                </span>
                <span class="flex flex-col">
                  <span class="font-semibold">{{ location.name }}</span>
                  <span class="text-xs text-slate-500">{{ location.subtitle }}</span>
                </span>
              </li>
            </ul>
          </div>
        </label>
        <label
          class="group relative flex flex-col rounded-xl border border-transparent bg-slate-50/80 p-4 shadow-inner transition hover:-translate-y-0.5 hover:border-orange-400/70 hover:shadow-md"
        >
          <span class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            <svg class="h-4 w-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16m-7 5h7" />
            </svg>
            Return location
          </span>
          <input
            type="text"
            formControlName="returnLocation"
            placeholder="Return city or office"
            (focus)="openReturnDropdown()"
            (input)="openReturnDropdown()"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-neutral-900 ring-2 ring-transparent transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-orange-100"
          />
          <div
            *ngIf="isReturnDropdownOpen"
            class="absolute left-0 right-0 top-full z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-orange-500/10"
          >
            <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Popular returns
              <span class="text-[10px] font-bold text-orange-500">EXPRESS</span>
            </div>
            <ul class="divide-y divide-slate-100">
              <li
                *ngFor="let location of returnSuggestions"
                class="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm text-neutral-900 transition hover:bg-orange-50"
                (click)="selectLocation('returnLocation', location.name)"
              >
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/10 text-orange-600">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 21s-6-5.686-6-10.25A6.25 6.25 0 0 1 12 4.5a6.25 6.25 0 0 1 6 6.25C18 15.314 12 21 12 21Z"
                    />
                    <circle cx="12" cy="10.75" r="1.5" />
                  </svg>
                </span>
                <span class="flex flex-col">
                  <span class="font-semibold">{{ location.name }}</span>
                  <span class="text-xs text-slate-500">{{ location.subtitle }}</span>
                </span>
              </li>
            </ul>
          </div>
        </label>
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="flex flex-col rounded-xl border border-transparent bg-slate-50/80 p-4 shadow-inner transition hover:-translate-y-0.5 hover:border-orange-400/70 hover:shadow-md">
            <span class="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Start date & time</span>
            <input
              type="datetime-local"
              formControlName="startDate"
              [min]="minDate"
              class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-neutral-900 ring-2 ring-transparent transition focus:border-orange-500 focus:ring-orange-100"
            />
            <small
              *ngIf="form.controls.startDate.invalid && (form.controls.startDate.dirty || form.controls.startDate.touched)"
              class="mt-1 text-xs font-semibold text-red-500"
            >
              Date cannot be in the past
            </small>
          </label>
          <label class="flex flex-col rounded-xl border border-transparent bg-slate-50/80 p-4 shadow-inner transition hover:-translate-y-0.5 hover:border-orange-400/70 hover:shadow-md">
            <span class="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">End date & time</span>
            <input
              type="datetime-local"
              formControlName="endDate"
              [min]="minDate"
              class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-neutral-900 ring-2 ring-transparent transition focus:border-orange-500 focus:ring-orange-100"
            />
            <small
              *ngIf="
                (form.controls.endDate.invalid || form.hasError('endBeforeStart')) &&
                (form.controls.endDate.dirty || form.controls.endDate.touched)
              "
              class="mt-1 text-xs font-semibold text-red-500"
            >
              End date must be after start date
            </small>
          </label>
        </div>
      </div>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-slate-600">Flexible schedules, premium vehicles, transparent pricing.</p>
        <button
          type="submit"
          [disabled]="form.invalid"
          class="inline-flex items-center justify-center rounded-full bg-[#ff5f00] px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-orange-500/30 transition hover:-translate-y-0.5 hover:shadow-orange-500/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          [class.opacity-50]="form.invalid"
        >
          View vehicles
        </button>
      </div>
    </form>
  `
})
export class SearchBarComponent {
  @Output() search = new EventEmitter<SearchPayload>();

  form!: FormGroup<{
    pickupLocation: FormControl<string>;
    returnLocation: FormControl<string>;
    startDate: FormControl<string>;
    endDate: FormControl<string>;
  }>;

  readonly minDate = this.formatDateTimeLocal(new Date());

  isPickupDropdownOpen = false;
  isReturnDropdownOpen = false;

  readonly popularLocations = [
    { name: 'Paris CDG Airport Terminal 2', subtitle: 'Charles de Gaulle · 24/7 desk' },
    { name: 'Paris Orly Airport', subtitle: 'Orly 1-2-3-4 · In-terminal pickup' },
    { name: 'Marseille Airport', subtitle: 'Provence · Hall A arrivals' },
    { name: 'Nice Côte d’Azur Airport', subtitle: 'Terminal 1 · Mediterranean view' },
    { name: 'Lyon Part-Dieu Station', subtitle: 'City center · Rail connection' },
    { name: 'Bordeaux–Mérignac Airport', subtitle: 'Gate B · Fast track' }
  ];

  constructor(
    private fb: FormBuilder,
    private searchState: SearchStateService,
    private router: Router,
    private elementRef: ElementRef
  ) {
    const savedSearch = this.searchState.getSearchPayload();
    this.form = this.fb.group({
      pickupLocation: this.fb.control<string>(savedSearch?.pickupLocation ?? '', { nonNullable: true }),
      returnLocation: this.fb.control<string>(savedSearch?.returnLocation ?? '', { nonNullable: true }),
      startDate: this.fb.control<string>(savedSearch?.startDate ?? '', {
        nonNullable: true,
        validators: this.futureDateValidator
      }),
      endDate: this.fb.control<string>(savedSearch?.endDate ?? '', { nonNullable: true })
    });

    this.form.addValidators(this.endDateValidator);
  }

  get pickupSuggestions() {
    return this.filterLocations(this.form.controls.pickupLocation.value);
  }

  get returnSuggestions() {
    return this.filterLocations(this.form.controls.returnLocation.value);
  }

  onSubmit(): void {
    if (this.form.valid) {
      const payload = this.form.getRawValue();
      this.searchState.setSearchPayload(payload);
      this.search.emit(payload);
      this.router.navigate(['/voitures']);
    }
  }

  openPickupDropdown(): void {
    this.isPickupDropdownOpen = true;
    this.isReturnDropdownOpen = false;
  }

  openReturnDropdown(): void {
    this.isReturnDropdownOpen = true;
    this.isPickupDropdownOpen = false;
  }

  selectLocation(controlName: 'pickupLocation' | 'returnLocation', location: string): void {
    this.form.controls[controlName].setValue(location);
    this.closeDropdowns();
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdowns();
    }
  }

  private filterLocations(term: string) {
    const lower = term.toLowerCase().trim();
    if (!lower) return this.popularLocations;
    return this.popularLocations.filter(
      (loc) => loc.name.toLowerCase().includes(lower) || loc.subtitle.toLowerCase().includes(lower)
    );
  }

  private closeDropdowns(): void {
    this.isPickupDropdownOpen = false;
    this.isReturnDropdownOpen = false;
  }

  private futureDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const min = new Date(this.minDate);
    return selectedDate >= min ? null : { pastDate: true };
  };

  private endDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup<{
      startDate: FormControl<string>;
      endDate: FormControl<string>;
    }>;

    const start = group.controls.startDate.value;
    const end = group.controls.endDate.value;
    const endControl = group.controls.endDate;

    if (!start || !end) {
      endControl.setErrors(null);
      return null;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const isAfter = endDate > startDate;

    if (!isAfter) {
      endControl.setErrors({ ...(endControl.errors ?? {}), endBeforeStart: true });
      return { endBeforeStart: true };
    }

    if (endControl.hasError('endBeforeStart')) {
      const { endBeforeStart, ...others } = endControl.errors ?? {};
      endControl.setErrors(Object.keys(others).length ? others : null);
    }

    return null;
  };

  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
