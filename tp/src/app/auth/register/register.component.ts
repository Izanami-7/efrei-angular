import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../auth.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: false
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(4)]),
      confirmPassword: new FormControl('', Validators.required),
    }, { validators: [this.checkPasswords, this.checkUsernamePassword] });
  }

  addUser() {
    if (this.registerForm.invalid) return;
    this.authService.addUser({
      username: this.registerForm.value.username,
      password: this.registerForm.value.password
    });
    this.router.navigate(['/login']);
  }

  private checkPasswords(formGroup: FormGroup) {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');
    return password?.value !== confirmPassword?.value ? { missMatch: true } : null;
  }

  private checkUsernamePassword(formGroup: FormGroup) {
    const username = formGroup.get('username')?.value;
    const passwordValue = formGroup.get('password')?.value;
    const passwordControl = formGroup.get('password');
    if (!username || !passwordValue) return null;
    if (passwordValue.includes(username)) {
      passwordControl?.setErrors({ usernamePassword: true });
      return { usernamePassword: true };
    }
    return null;
  }

  get getErrorLabel() {
    if (this.registerForm.errors?.['required']) return 'Les champs sont obligatoires';
    if (!!this.registerForm.controls?.['password']?.errors?.['minlength']) return `La longueur minimal pour votre mot de passe est ${this.registerForm.controls?.['password']?.errors?.['minlength']?.requiredLength}`;
    if (this.registerForm.errors?.['missMatch']) return 'Les mots de passe ne correspondent pas';
    if (this.registerForm.errors?.['usernamePassword']) return 'Le mot de passe comporte des informations personnelles';
    return 'Un problème est survenu';
  }
}
