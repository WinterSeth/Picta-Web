import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { tokenInterceptor } from './services/token-interceptor.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { importProvidersFrom, isDevMode, LOCALE_ID } from '@angular/core';
import {
  MAT_DATE_LOCALE,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import localeEsUS from '@angular/common/locales/es-US';
import {
  PRECONNECT_CHECK_BLOCKLIST,
  registerLocaleData,
} from '@angular/common';
import {
  provideMatomo,
  withRouter,
  withRouteData,
  withRouterInterceptors,
} from 'ngx-matomo-client';
import { provideMarkdown } from 'ngx-markdown';
import { QRCodeComponent } from 'angularx-qrcode';

const config: SocketIoConfig = { url: 'https://natio.picta.cu/', options: {} };
// Registra los datos de localización para 'es-US'
registerLocaleData(localeEsUS);

export const appConfig = {
  providers: [
    QRCodeComponent,
    provideMarkdown(),
    provideMatomo(
      {
        siteId: 1,
        trackerUrl: 'https://piatex.mprc.cu',
      },
      withRouter(),
      withRouteData(), // Add this feature
    ),
    // Configuración para NgOptimizedImage
    //provideImgixLoader('https://www.picta.cu'),
    // Precarga solo después de la llamada API
    {
      provide: PRECONNECT_CHECK_BLOCKLIST,
      useValue: 'https://www.picta.cu',
    },
    importProvidersFrom(SocketIoModule.forRoot(config)),
    { provide: MAT_DATE_LOCALE, useValue: 'es-CU' },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 5000 } },
    { provide: LOCALE_ID, useValue: 'es-US' },
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top', // Mejor experiencia SSR
        anchorScrolling: 'enabled',
      }),
      //withPreloading(PreloadAllModules)
    ),
    /*     provideClientHydration(
      withHttpTransferCacheOptions({
        includePostRequests: true, // Cache para peticiones POST
        filter: (req) => !req.url.includes('/api/'), // Excluye APIs
        includeHeaders: ['content-type'] // Headers a cachear
      })
    ), */
    provideAnimations(),
    provideNativeDateAdapter(),
    provideEnvironmentNgxMask(),
    provideHttpClient(
      withFetch(),
      /*       withXsrfConfiguration({ // Protección CSRF
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN'
      }), */
      withInterceptors([tokenInterceptor]),
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
