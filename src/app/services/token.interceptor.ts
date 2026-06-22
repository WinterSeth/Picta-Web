/* import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
}; */

import { inject } from '@angular/core';
import { HttpEvent, HttpEventType, HttpHandler, HttpHandlerFn, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { AuthService } from './auth.service';
import { tap } from 'rxjs';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  // Inject the current `AuthService` and use it to get an authentication token:
  const authToken = inject(AuthService);
  // Clone the request to add the authentication header.
  const newReq = req.clone({ setHeaders: { Authorization: `Bearer ${authToken.getToken()}`}});
  return next(newReq).pipe(
    tap(event => {    
      if (event.type === HttpEventType.Response) {      
        console.log(req.url, 'returned a response with status', event.status);    
      }  
    }));
}
