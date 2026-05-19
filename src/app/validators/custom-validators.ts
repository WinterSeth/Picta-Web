import {AbstractControl, ValidationErrors} from '@angular/forms';

export class CustomValidators {
  static passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password: string = control.get('password')?.value;
    const confirmPassword: string = control.get('repeat_password')?.value;

    if (password !== confirmPassword) {
      control.get('repeat_password')?.setErrors({ NoPasswordMatch: true });
      return { NoPasswordMatch: true }; // 👈 Retorna el error
    } else {
      control.get('repeat_password')?.setErrors(null); // 👈 Limpia errores si coinciden
      return null; // 👈 Retorna null cuando es válido
    }
  }
}
