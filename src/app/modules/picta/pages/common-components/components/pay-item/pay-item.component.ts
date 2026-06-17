import { Component, inject, PLATFORM_ID, viewChild, OnDestroy } from '@angular/core';
import { MatStepper, MatStep } from '@angular/material/stepper';
 import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { PaymentService } from '../../../profile/services/payment.service';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import {MatSnackBar,} from '@angular/material/snack-bar';
import { LoaderService } from '../../../../services/loader.service';
import { MatListOption, MatSelectionListChange, MatSelectionList, MatListItemTitle, MatListItemLine, MatListItemAvatar } from '@angular/material/list';
import { Subject, throwError } from 'rxjs';
import { AsyncPipe, isPlatformBrowser, NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { catchError, finalize, map, takeUntil } from 'rxjs';
import { Platform } from '@angular/cdk/platform';
import { AuthService } from '../../../../../../services/auth.service';
import { CanalService } from '../../../canal/services/canal-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { QRCodeComponent } from 'angularx-qrcode';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { MatomoTracker } from 'ngx-matomo-client';
import { NotificationService } from '../../../../../../services/notification.service';

@Component({
    selector: 'app-pay-item',
    templateUrl: './pay-item.component.html',
    styleUrls: ['./pay-item.component.scss'],
    imports: [
    MatDialogContent,
    MatStepper,
    MatStep,
    MatSelectionList,
    MatListItemTitle,
    MatListOption,
    MatListItemLine,
    MatListItemAvatar,
    QRCodeComponent,
    MatButtonModule,
    MatIconModule,
    MatDialogClose,
    AsyncPipe,
    NgOptimizedImage,
    NgTemplateOutlet,
    MatProgressSpinner
]
})
export class PayItemComponent implements OnDestroy {
  dialogRef = inject<MatDialogRef<PayItemComponent>>(MatDialogRef);
  data = inject<any>(MAT_DIALOG_DATA);
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private loaderService = inject(LoaderService);
  platform = inject(Platform);
  private platformId = inject(PLATFORM_ID);

  private paymentService = inject(PaymentService);
  private canalService = inject(CanalService);
  private router = inject(Router);
  private matomo = inject(MatomoTracker);
  private notification=inject(NotificationService)

  selectedPaymentMethod: string;
  currentStep = 0;
  isMethodLoading = false;

  isLoading: boolean = true;
  // Ejemplo con una URL dinámica
  urlSegura: SafeResourceUrl;

  generatedQRData: string;
  readonly stepperCmp = viewChild<MatStepper>('stepper');
  readonly paymentStepper = viewChild<MatStepper>('paymentStepper');
  ticket: string;
  payWindow: Window;
  qr = {
    id_transaccion: '',
    importe: 0,
    moneda: 'CUP',
    numero_proveedor: '',
    version: '1',
  };
  tmLink: SafeUrl = '';
  stopSubscription = new Subject();
  public myAngularxQrCode: string = null;

  get isInternational(): boolean {
    return this.data?.video?.internacional === true;
  }

  filterMethods(methods: string[]): string[] {
    if (this.isInternational) {
      return methods.filter(m => m === 'lp');
    }
    return methods.filter(m => m !== 'lp');
  }

  paymentM$: any = this.paymentService.checkPayementMethods().pipe(
    map((res) => {
      this.isLoading = false;
      return res;
    })
  )

  constructor() {
    const iconRegistry = this.iconRegistry;
    const sanitizer = this.sanitizer;

    // assign a value
    this.myAngularxQrCode = 'Your QR code data string';
    iconRegistry.addSvgIcon(
      'qrself',
      sanitizer.bypassSecurityTrustResourceUrl(
        'icons/qr_code_scanner-24px.svg'
      )
    );
  }

  ngOnDestroy() {
    this.stopSubscription.next(true);
    this.stopSubscription.complete();
  }

  onPaymentMethodChange(event: MatSelectionListChange) {
    this.selectedPaymentMethod = event.options[0].value;
    console.log(this.selectedPaymentMethod);
    
    // Determinar el siguiente paso basado en el método de pago seleccionado
    switch(this.selectedPaymentMethod) {
      case 'credit-card':
        this.currentStep = 1; // Paso para tarjeta de crédito
        break;
      case 'paypal':
        this.currentStep = 2; // Paso para PayPal
        break;
      case 'bank-transfer':
        this.currentStep = 3; // Paso para transferencia bancaria
        break;
      default:
        this.currentStep = 0; // Volver al paso inicial
    }
  }

  // Método para sanitizar la URL
  cargarIframe(url: string) {
    this.urlSegura = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  get parsedQR() {
    return JSON.stringify(this.qr);
  }

  get isSubscriptionPayment(): boolean {
    const externalId = this.data?.externalId;
    return typeof externalId === 'string' && (externalId.startsWith('pago_suscripcion_') || externalId.startsWith('suscripcion_canal_'));
  }

  goPremium(options: MatListOption[]) {
    const { value } = options[0];
    const items = [];
    items.push(this.data.offer.id);
    switch (value) {
      case 'enzonaDirect': {
        this.loaderService.show();
        this.paymentService.createPayment(items).subscribe(
          (res: any) => {
            const { link_confirm, ticket } = res;
            this.loaderService.hide();
            this.subscribeToTicket(ticket);
            if (isPlatformBrowser(this.platformId)) {
              this.payWindow = window.open(link_confirm, '_blank');
            }
          },
          error => {
            this.loaderService.hide();
            return throwError(error);
          }
        );

        break;
      }
      case 'enzonaQR': {
        this.paymentService.createQR(items).subscribe((res: any) => {
          const { image, qr_code, ticket } = res;
          this.ticket = ticket;
          this.subscribeToTicket(ticket);
          this.generatedQRData = 'data:image/png;base64,' + image;
          this.stepperCmp().next();
        });

        break;
      }
    }
  }

  subscribeToTicket(ticket) {
    this.authService.payment$
      .pipe(takeUntil(this.stopSubscription))
      .subscribe((notification: any) => {
        if (notification && notification.tipo === 'notificacion_pago') {
          if (this.data.canal_id) {
            this.canalService.esMiembro(this.data.canal_id).subscribe();
          }
          this.dialogRef.close('payment-successful');
        }
      });
  }

  selectMethod($event: MatSelectionListChange) {
    this.stepperCmp().next();
  }

/*   ngAfterViewInit(): void {
    const headerContainer = document.querySelector(
      '.mat-horizontal-stepper-header-container '
    );
    const childArray = Array.from(headerContainer.childNodes);
    childArray.slice(5).forEach(node => node.remove());
  } */

  private trackSubscriptionPaymentCompletion(): void {
    if (!this.isSubscriptionPayment) {
      return;
    }

    const externalId = this.data?.externalId;

    setTimeout(() => this.matomo.trackEvent('suscripciones', 'compra_completada', externalId), 0);
  }

  private notifyResult() {
    this.trackSubscriptionPaymentCompletion();
    this.dialogRef.close('payment-successful');
    this.stopSubscription.next(true);
  }

  handleTransfermovil(): void {
    if (this.isMethodLoading) {
      return;
    }

    const payment = {
      gateway: 'tr',
      type: 'payment',
      buyer: this.authService.userData.username.slice(0, 20),
      buyer_phone: this.authService.userData.phone_number,
      canal_id: this.data.canal_id,
      items: [
        {
          id: this.data.offer.id,
          quantity: 1,
        },
      ],
    };
    if(this.authService.userData.phone_number){
      this.isMethodLoading = true;
      this.paymentService.payTr(payment)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(
            'Ha ocurrido un error generando el pago. Intente más tarde.'
          );
          throw err;
        }),
        finalize(() => {
          this.isMethodLoading = false;
        })
      )
      .subscribe((payItem: any) => {
        this.qr = payItem.qr;
        this.tmLink = this.sanitizer.bypassSecurityTrustUrl(
          `transfermovil://tm_compra_en_linea/action?id_transaccion=${this.qr.id_transaccion}&importe=${this.qr.importe}&moneda=${this.qr.moneda}&numero_proveedor=${this.qr.numero_proveedor}&version=${this.qr.version}`
        );
        this.subscribeToTicket(payItem.ticket);
        this.stepperCmp().next();
      });
    } else {
      this.snackBar.open(
        'Para realizar el pago debe asociar un número de teléfono a su cuenta.'
      );
    }
  }

  handleLaberinto(): void {
    if (this.isMethodLoading) {
      return;
    }

    const payment = {
      gateway: 'lp',
      return_url: `https://www.picta.cu${this.router.url}`,
      type: 'payment',
      buyer: this.authService.userData.username.slice(0, 20),
      buyer_phone: this.authService.userData.phone_number,
      canal_id: this.data.canal_id,
      items: [
        {
          id: this.data.offer.id,
          quantity: 1,
        },
      ],
    };
    if(this.authService.userData.phone_number){
      this.isMethodLoading = true;
      this.paymentService.payTr(payment)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Error generando el pago con Laberinto:', err);
          const msg = (Array.isArray(err.error?.error) ? err.error.error[0] : err.error?.error) || err.error?.message || err.error?.detail || err.message || 'Ha ocurrido un error generando el pago. Intente más tarde.';
          const snackBarRef = this.snackBar.open(msg, 'Ir a configurar', { duration: 8000 });
          snackBarRef.onAction().subscribe(() => {
            window.open('https://www.picta.cu/profile/configuracion', '_blank');
          });
          return throwError(() => err);
        }),
        finalize(() => {
          this.isMethodLoading = false;
        })
      )
      .subscribe((payItem: any) => {
        const urlDinamica = payItem.payment_url;
        this.urlSegura = this.sanitizer.bypassSecurityTrustResourceUrl(urlDinamica);
        this.stepperCmp().next();
      });
    } else {
      this.snackBar.open(
        'Para realizar el pago debe asociar un número de teléfono a su cuenta.'
      );
    }
  }

  handleEnzona(): void {
    if (this.isMethodLoading) {
      return;
    }

    const payment = {
      gateway: 'ez',
      type: 'payment',
      buyer: this.authService.userData.username.slice(0, 20),
      buyer_phone: this.authService.userData.phone_number,
      canal_id: this.data.canal_id,
      items: [
        {
          id: this.data.offer.id,
          quantity: 1,
        },
      ],
    };

    this.isMethodLoading = true;
    this.paymentService.payTr(payment)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Error en pago EnZona:', err);
          const msg = err.error?.message || err.error?.detail || 'Ha ocurrido un error generando el pago. Intente más tarde.';
          this.snackBar.open(msg);
          return throwError(() => err);
        }),
        finalize(() => {
          this.isMethodLoading = false;
        })
      )
      .subscribe((payItem: any) => {
        const urlDinamica = payItem.payment_url;
        this.urlSegura = this.sanitizer.bypassSecurityTrustResourceUrl(urlDinamica);
        if (payItem.ticket) {
          this.subscribeToTicket(payItem.ticket);
        }
        this.stepperCmp().next();
      });
  }
}
