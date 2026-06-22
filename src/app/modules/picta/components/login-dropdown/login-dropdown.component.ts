import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { RegisterFormComponent } from '../../pages/register/components/register/register-form/register-form.component';
import { LoginFormComponent } from '../../pages/login/components/login-form/login-form.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';

@Component({
    selector: 'app-login-dropdown',
    templateUrl: './login-dropdown.component.html',
    styleUrls: ['./login-dropdown.component.scss'],
    standalone: true,
    imports: [MatTabGroup, MatTab, LoginFormComponent, RegisterFormComponent]
})
export class LoginDropdownComponent implements OnInit {
  @Output() loggedIn = new EventEmitter();


  constructor() {
  }

  ngOnInit() {
  }

}
