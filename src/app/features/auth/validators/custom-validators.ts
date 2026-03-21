// src/app/features/auth/validators/custom-validators.ts
import { ValidatorFn, AbstractControl, ValidationErrors, AsyncValidatorFn } from "@angular/forms";
import { Observable, of, debounceTime, switchMap, catchError } from "rxjs";
import { AuthApiService } from "../services/auth-api.service";

export class CustomValidators {
  static passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const isValidLength = value.length >= 8;
      const passwordValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isValidLength;
      return !passwordValid ? {
        passwordStrength: {
          hasUpperCase,
          hasLowerCase,
          hasNumber,
          hasSpecialChar,
          isValidLength
        }
      } : null;
    };
  }

  static emailExistsValidator(authApiService: AuthApiService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const email = control.value;
      if (!email || email.length < 3) {
        return of(null);
      }

      return authApiService.checkEmailExists(email).pipe(
        debounceTime(500),
        switchMap((exists: boolean) => {
          return of(exists ? { emailExists: true } : null);
        }),
        catchError(() => of(null))
      );
    };
  }
}