import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page text-neutral-900">
      <h1>Inscription</h1>
      <form [formGroup]="form" (ngSubmit)="submit()" class="card">
        <label>
          Email
          <input formControlName="mail" type="email" placeholder="email@exemple.fr" />
        </label>
        <label>
          Username
          <input formControlName="username" placeholder="pseudo" />
        </label>
        <label>
          Password
          <input type="password" formControlName="password" />
        </label>
        <label>
          Confirm password
          <input type="password" formControlName="confirm" />
        </label>
        <button type="submit" [disabled]="form.invalid">Create my account</button>
        <p class="error" *ngIf="error">The passwords do not match.</p>
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
        background-color: #0c8b2f;
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
export class RegisterPage {
  error = false;
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    mail: ['', [Validators.required, Validators.email]],
    username: ['', Validators.required],
    password: ['', Validators.required],
    confirm: ['', Validators.required]
  });

  submit(): void {
    this.error = false;
    if (this.form.invalid) return;
    const { mail, username, password, confirm } = this.form.getRawValue();
    if (password !== confirm) {
      this.error = true;
      return;
    }
    if (mail && username && password) {
      this.auth.register(mail, username, password);
      const redirect = this.route.snapshot.queryParamMap.get('redirect');
      this.router.navigate([redirect || '/mon-compte']);
    }
  }
}
