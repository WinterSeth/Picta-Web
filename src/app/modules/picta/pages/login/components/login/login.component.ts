import { Component, signal, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../../../services/auth.service';
import { LoginFormComponent } from '../login-form/login-form.component';
import { NgOptimizedImage } from '@angular/common';
import { LocalstorageService } from '../../../../../../services/localstorage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [LoginFormComponent, NgOptimizedImage]
})
export class LoginComponent implements OnInit {
  private title = inject(Title);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private loginService = inject(AuthService);
  private localstorage = inject(LocalstorageService);

  reauthReason = signal<string | null>(null);

  ngOnInit(): void {
    this.title.setTitle('Entrar - Picta');
    
    if (this.loginService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    // Check for re-authentication reason from query params
    this.route.queryParams.subscribe(params => {
      if (params['reason']) {
        this.reauthReason.set(params['reason']);
        // Clear the pending redirect URL since we're now at the login page
        this.localstorage.removeItem('pending_redirect_url');
      }
    });
  }
}