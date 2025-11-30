import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../components/search-bar.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, SearchBarComponent],
  template: `
    <section class="relative isolate overflow-hidden bg-gradient-to-br from-black via-neutral-900 to-slate-950 text-white">
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,95,0,0.15),_transparent_45%),radial-gradient(circle_at_20%_20%,_rgba(255,255,255,0.05),_transparent_35%)]"
      ></div>
      <div class="absolute inset-0 opacity-30">
        <img
          src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1400&q=80"
          alt="Premium car"
          class="h-full w-full object-cover"
        />
      </div>
      <div class="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-black opacity-80"></div>

      <div class="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-4 py-16 lg:flex-row lg:gap-10">
        <div class="flex-1 space-y-6 text-center lg:text-left">
          <p class="text-sm uppercase tracking-[0.4em] text-orange-400">Premium cheap rentals</p>
          <h1 class="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Experience the road with the elegance and performance of Lowcation low price cars.
          </h1>
          <p class="text-lg text-slate-200 lg:max-w-2xl">
            Reserve your next ride with elevated comfort, curated options, and seamless pickup planning in seconds.
          </p>
          <div class="flex items-center justify-center gap-4 lg:justify-start">
            <div class="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500/70 to-transparent lg:hidden"></div>
            <div class="hidden h-px w-24 bg-gradient-to-r from-orange-500 to-transparent lg:block"></div>
            <span class="text-sm font-semibold text-orange-400">Trusted by modern travelers worldwide</span>
          </div>
        </div>

        <div class="flex-1">
          <div class="mx-auto w-full max-w-2xl rounded-2xl bg-white/95 p-6 shadow-2xl shadow-orange-500/20 ring-1 ring-white/40 backdrop-blur">
            <h2 class="mb-4 text-center text-lg font-semibold text-neutral-900">Plan your next journey</h2>
            <app-search-bar></app-search-bar>
          </div>
        </div>
      </div>
    </section>
  `
})
export class LandingPage {}
