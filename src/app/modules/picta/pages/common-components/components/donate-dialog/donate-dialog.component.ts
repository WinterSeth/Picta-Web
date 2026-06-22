import { AfterViewInit, Component, OnInit, PLATFORM_ID, viewChild, inject } from '@angular/core';
import { MatStepper, MatStep, MatStepperNext } from '@angular/material/stepper';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { PaymentService } from '../../../profile/services/payment.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoaderService } from '../../../../services/loader.service';
import { MatListOption, MatSelectionListChange, MatSelectionList, MatListSubheaderCssMatStyler } from '@angular/material/list';
import { Subject, throwError } from 'rxjs';
import { SseService } from '../../../../../../services/sse.service';
import { isPlatformBrowser } from '@angular/common';
import { catchError, map, takeUntil } from 'rxjs';
import { Platform } from '@angular/cdk/platform';
import { AuthService } from '../../../../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UntypedFormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatLine } from '@angular/material/core';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatError } from '@angular/material/form-field';

@Component({
    selector: 'app-donate-dialog',
    templateUrl: './donate-dialog.component.html',
    styleUrls: ['./donate-dialog.component.scss'],
    imports: [
    MatDialogContent,
    MatStepper,
    MatStep,
    MatFormField,
    ReactiveFormsModule,
    MatInput,
    MatError,
    MatStepperNext,
    MatButton,
    MatSelectionList,
    MatListSubheaderCssMatStyler,
    MatListOption,
    MatLine,
    MatDialogClose
]
})
export class DonateDialogComponent implements OnInit, AfterViewInit {
  dialogRef = inject<MatDialogRef<DonateDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private paymentService = inject(PaymentService);
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private loaderService = inject(LoaderService);
  private sseService = inject(SseService);
  private dialog = inject(MatDialog);
  platform = inject(Platform);
  private platformId = inject(PLATFORM_ID);

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
  amount = new UntypedFormControl(1, [Validators.required, Validators.min(1)]);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const iconRegistry = this.iconRegistry;
    const sanitizer = this.sanitizer;

    iconRegistry.addSvgIcon(
      'qrself',
      sanitizer.bypassSecurityTrustResourceUrl(
        'icons/qr_code_scanner-24px.svg'
      )
    );
  }

  ngOnInit() {}

  get parsedQR() {
    return JSON.stringify(this.qr);
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
        if (notification?.ticket === ticket) {
          this.notifyResult();
        }
      });
  }

  completedQr() {
    this.snackBar.open('Qué hago ahora????');
  }

  selectMethod($event: MatSelectionListChange) {
    this.stepperCmp().next();
  }

  ngAfterViewInit(): void {
    const headerContainer = document.querySelector(
      '.mat-horizontal-stepper-header-container '
    );
    const childArray = Array.from(headerContainer.childNodes);
    childArray.slice(5).forEach(node => node.remove());
  }

  checkPayment() {
    this.loaderService.show();
    this.paymentService
      .checkPayedItems()
      .pipe(map((resp: any) => resp.paid))
      .subscribe((paid: string[]) => {
        if (paid.length) {
          const paidItem = paid.filter(
            payment => payment === this.data.externalId
          );
          if (paidItem.length) {
            this.snackBar.open('Pago comprobado');
            this.dialogRef.close('payment-successful');
          } else {
            this.snackBar.open('No se detectaron pagos con este código QR');
          }
        } else {
          this.snackBar.open('No se detectaron pagos con este código QR');
        }
        this.loaderService.hide();
      });
  }

  private notifyResult() {
    this.dialogRef.close('donation-successful');
    this.stopSubscription.next(true);
  }

  handleTransfermovil(): void {
    const payment = {
      gateway: 'tr',
      type: 'donation',
      channel_id: this.data.channel_id,
      buyer: this.authService.userData.username,
      buyer_phone: this.authService.userData.phone_number,
      amount: this.amount.value,
    };
    this.paymentService
      .payTr(payment)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(
            `Ha ocurrido un error generando el pago. Intente más tarde.`
          );
          throw err;
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
  }
}
