import {Component, inject, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import { RegisterFormComponent } from './register-form/register-form.component';
import { NgOptimizedImage } from '@angular/common';

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    providers: [],
    imports: [RegisterFormComponent, NgOptimizedImage, MatIcon, MatDialogModule]
})
export class RegisterComponent {
  private title = inject(Title);
  private router = inject(Router);

  registerSuccess: boolean = false;
  loading: boolean = false;

  constructor() {
    this.title.setTitle('Registro - Picta');
  }

  registerCompleted() {
    this.router.navigate(['']);
  }
}
