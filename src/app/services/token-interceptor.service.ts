import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { catchError, throwError, switchMap, filter, take, BehaviorSubject, tap } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Router, NavigationExtras } from '@angular/router';
import { MatomoTracker } from 'ngx-matomo-client';
import { LocalstorageService } from './localstorage.service';
import { ActivePerfilService } from './active-perfil.service';

// Global state for refresh token management (Picta)
let isPictaRefreshing = false;
let pictaRefreshTokenSubject = new BehaviorSubject<string | null>(null);

// Constants for device requirement errors
const DEVICE_REQUIRED_CODES = [
  'DEVICE_REQUIRED',
  'DEVICE_ID_MISSING',
  'DEVICE_ID_INVALID',
  'NO SE PUDO IDENTIFICAR EL DISPOSITIVO',
  'IDENTIFICAR EL DISPOSITIVO'
];
const SESSION_REAUTH_REASON = 'device_required';

/**
 * HTTP Interceptor for Picta API requests
 * Adds Bearer token authentication
 * Adds X-Device-Id header
 * Adds X-Profile-Id header when profile is active
 * Handles 401 Unauthorized by attempting token refresh
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const localstorage = inject(LocalstorageService);
  const activePerfilService = inject(ActivePerfilService);
  const matomo = inject(MatomoTracker);
  const router = inject(Router);

  const isS3Request = req.url.includes('s3.picta.cu');
  const isVideosRequest = req.url.includes('videos.picta.cu');
  const isAuthRequest = req.url === environment.authUrl;
  const isPictaApiRequest = req.url.startsWith(environment.baseUrl);
  
  let modifiedReq = req;

  // Add X-Device-Id header to Picta API requests (except auth endpoints)
  // Only send if device ID already exists in localStorage (not generated)
  if (isPictaApiRequest && !isAuthRequest) {
    const deviceId = localstorage.getDeviceId();
    if (deviceId && !req.headers.has('X-Device-Id')) {
      modifiedReq = req.clone({
        setHeaders: {
          'X-Device-Id': deviceId
        }
      });
    }

    // Add X-Profile-Id header if there's an active profile
    const activeProfileId = activePerfilService.getActiveProfileIdValue();
    if (activeProfileId !== null && !req.headers.has('X-Profile-Id')) {
      modifiedReq = modifiedReq.clone({
        setHeaders: {
          'X-Profile-Id': String(activeProfileId)
        }
      });
    }
  }
  
  // Add authorization header for Picta API requests (excluding S3, videos)
  if (!isS3Request && !isVideosRequest && authService.isLoggedIn()) {
    if (!isAuthRequest) {
      modifiedReq = modifiedReq.clone({ setHeaders: { Authorization: `Bearer ${authService.getToken()}` } });
    }
  }

  // Configure Matomo user tracking
  const credencialString = localStorage.getItem('credentials');
  if (credencialString) {
    try {
      const credencial = JSON.parse(credencialString);
      const username = credencial?.user?.username || null;
      if (username) {
        matomo.setUserId(username);
      }
    } catch (error) {
      console.error('Error al parsear credencial:', error);
    }
  }

  return next(modifiedReq).pipe(
    tap((event) => {
      // Save X-Device-Id from response headers if available
      if (isPictaApiRequest && event instanceof HttpResponse) {
        const responseDeviceId = event.headers.get('X-Device-Id') || event.headers.get('x-device-id');
        if (responseDeviceId) {
          localstorage.setDeviceId(responseDeviceId);
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      // Check if backend requires device ID re-registration
      // Also check error.error.detail (Django rest framework default error field)
      const errorCode = error.error?.code || error.error?.error || error.error?.detail || '';
      const isDeviceRequired = DEVICE_REQUIRED_CODES.some(code => 
        errorCode.toUpperCase().includes(code) || 
        error.message?.toUpperCase().includes(code)
      );

      if (isDeviceRequired && isPictaApiRequest && !isAuthRequest) {
        console.warn('Device ID required by backend. Forcing re-authentication.');
        
        // Save current URL for redirect after re-auth
        const currentUrl = req.url;
        if (currentUrl) {
          localstorage.setItem('pending_redirect_url', currentUrl);
        }

        // Clear device ID and force logout with reason
        localstorage.clearDeviceId();
        authService.forceLogoutWithReason(SESSION_REAUTH_REASON);
        
        return throwError(() => error);
      }

      // Handle 401/403 Unauthorized for Picta API
      if ((error.status === 401 || error.status === 403) && !isS3Request && !isVideosRequest) {
        // Don't retry token refresh requests themselves
        if (isAuthRequest) {
          isPictaRefreshing = false;
          pictaRefreshTokenSubject.next(null);
          authService.logout();
          router.navigate(['/inicio']);
          return throwError(() => error);
        }

        // Check if we're already refreshing to avoid multiple refresh requests
        if (!isPictaRefreshing) {
          isPictaRefreshing = true;
          pictaRefreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap(() => {
              // Token refreshed successfully
              isPictaRefreshing = false;
              const newToken = authService.getToken();

              if (newToken) {
                // Notify all waiting requests that token is ready
                pictaRefreshTokenSubject.next(newToken);

                // Retry the original request with new token
                const retryReq = modifiedReq.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                });
                return next(retryReq);
              }
              return throwError(() => new Error('Failed to get new token'));
            }),
            catchError((refreshError) => {
              // Refresh failed, logout user
              isPictaRefreshing = false;
              pictaRefreshTokenSubject.next(null);
              console.error('Refresh token failed:', refreshError);
              authService.logout();
              router.navigate(['/inicio']);
              return throwError(() => refreshError);
            })
          );
        } else {
          // Already refreshing, wait for the new token
          return pictaRefreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap((newToken) => {
              // Retry request with new token
              const retryReq = modifiedReq.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(retryReq);
            })
          );
        }
      }

      // Handle other errors
      if (error instanceof HttpErrorResponse && error.status !== 401 && error.status !== 403) {
        console.error('HTTP error:', error);
      }

      return throwError(() => error);
    })
  );
};