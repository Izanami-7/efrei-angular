import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page text-neutral-900">
      <h1>Connexion</h1>
      <form [formGroup]="form" (ngSubmit)="submit()" class="card">
        <label>
          Email or username
          <input formControlName="identifier" placeholder="email@exemple.fr" />
        </label>
        <label>
          Password
          <input type="password" formControlName="password" placeholder="******" />
        </label>
        <button type="submit" [disabled]="form.invalid">Log in</button>
        <p class="error" *ngIf="error">Invalid credentials.</p>
        <p>No account? <a routerLink="/inscription">Register</a></p>
      </form>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 420px;
        margin: 0 auto;
      }
      form.card {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        padding: 1.2rem;
        border: 1px solid #ddd;
        border-radius: 8px;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-weight: 600;
      }
      input {
        padding: 0.6rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      button {
        padding: 0.7rem;
        background-color: #0066cc;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .error {
        color: #c0392b;
      }
    `
  ]
})
export class LoginPage {
  error = false;
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    identifier: ['', Validators.required],
    password: ['', Validators.required]
  });

  async submit(): Promise<void> {
    this.error = false;
    if (this.form.invalid) return;
    const { identifier, password } = this.form.getRawValue();
    if (!identifier || !password) return;

    const success = await this.auth.login(identifier, password);
    if (success) {
      this.router.navigate(['/cars']);
    } else {
      this.error = true;
    }
  }
}
