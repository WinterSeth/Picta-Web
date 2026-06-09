# Restaurar Selección de Perfiles

Para restaurar la pantalla de "¿Quién está viendo?" después del login, revertir estos cambios:

## 1. `src/app/modules/picta/pages/login/components/login-form/login-form.component.ts`

### Import: volver a `switchMap` simple

```diff
- import { switchMap, tap, mergeMap } from 'rxjs';
- import { PerfilesService } from '../../../../../../services/perfiles.service';
+ import { switchMap, tap } from 'rxjs';
```

### Inject: quitar PerfilesService

```diff
  private credentialsService = inject(CredentialsService);
  private localstorage = inject(LocalstorageService);
- private perfilesService = inject(PerfilesService);
```

### Método login(): restaurar switchMap y navegación a /perfil

```diff
        switchMap(() => this.loginService.getUserData()),
-       mergeMap((res: any) => {
-         this.credentialsService.setCredentials({ user: res, ...this.credentialsService.credentials });
-         this.loginService.setUserData(res);
-         this.loggedIn.emit();
-
-         // Fetch profiles and auto-select one
-         return this.perfilesService.getAll().pipe(
-           tap((profileRes: any) => {
-             const list = profileRes?.results || profileRes || [];
-             if (list.length > 0) {
-               const principal = list.find((p: any) => p.clasificacion === 'PRINCIPAL');
-               const selected = principal || list[0];
-               this.perfilesService.setActive(selected.id).subscribe(() => {
-                 this.activePerfilService.setActiveProfileId(selected.id);
-               });
-             }
-           })
-         );
-       })
+       switchMap(() => this.loginService.getUserData())
      ).subscribe({
-       next: () => {
-         this.isLoggingIn.set(false);
-
-         // Redirect to original destination or home after login
-         if (this.pendingRedirectUrl) {
-           this.router.navigateByUrl(this.pendingRedirectUrl);
-         } else {
-           this.router.navigate(['/']);
-         }
+       next: (res: any) => {
+         this.isLoggingIn.set(false);
+         this.credentialsService.setCredentials({ user: res, ...this.credentialsService.credentials });
+         this.loginService.setUserData(res);
+         this.loggedIn.emit();
+
+         // Redirect to original destination or profile selector after login
+         if (this.pendingRedirectUrl) {
+           this.router.navigateByUrl(this.pendingRedirectUrl);
+         } else {
+           this.router.navigate(['/perfil']);
+         }
        },
```

## 2. `src/app/modules/picta/pages/profile/components/seleccionar-perfil/seleccionar-perfil.component.ts`

### Quitar auto-selección de perfiles múltiples

```diff
      next: (res: any) => {
        const list = res?.results || res || [];
        this.profiles.set(list);
        this.loading.set(false);
-
-       // Auto-select profile: principal > first > none
-       if (list.length === 1) {
-         this.selectProfile(list[0]);
-       } else if (list.length > 1) {
-         const principal = list.find((p: Perfil) => p.clasificacion === 'PRINCIPAL');
-         this.selectProfile(principal || list[0]);
-       }
      },
```
