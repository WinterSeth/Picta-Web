import { AfterViewInit, Component, OnInit, PLATFORM_ID, viewChild, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import {PaymentService} from '../../services/payment.service';
import { MatIconRegistry, MatIcon } from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import { MatListOption, MatSelectionListChange, MatList, MatListItem, MatSelectionList, MatListSubheaderCssMatStyler } from '@angular/material/list';
import { MatStepper, MatStep } from '@angular/material/stepper';
import {MatSnackBar} from '@angular/material/snack-bar';
import {LoaderService} from '../../../../services/loader.service';
import {throwError} from 'rxjs';
import {PaymentDetailsComponent} from '../payment-details/payment-details.component';
import {PaymentListComponent} from '../payment-list/payment-list.component';
import { isPlatformBrowser } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { CdkStepperNext, CdkStepperPrevious } from '@angular/cdk/stepper';

@Component({
    selector: 'app-premium-dialog',
    templateUrl: './premium-dialog.component.html',
    styleUrls: ['./premium-dialog.component.scss'],
    imports: [MatDialogContent, MatStepper, MatStep, MatList, MatListItem, MatIcon, CdkStepperNext, MatButton, MatSelectionList, MatListSubheaderCssMatStyler, MatListOption, CdkStepperPrevious, MatDialogActions, MatDialogClose]
})
export class PremiumDialogComponent implements OnInit, AfterViewInit {
  dialogRef = inject<MatDialogRef<PremiumDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private paymentService = inject(PaymentService);
  private iconRegistry = inject(MatIconRegistry);
  private snackBar = inject(MatSnackBar);
  private loaderService = inject(LoaderService);
  private dialog = inject(MatDialog);
  private platformId = inject(PLATFORM_ID);

  generatedQRData: string;
  readonly stepperCmp = viewChild<MatStepper>('stepper');
  readonly paymentStepper = viewChild<MatStepper>('paymentStepper');
  ticket: string;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const iconRegistry = this.iconRegistry;
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'qrself',
      sanitizer.bypassSecurityTrustResourceUrl('icons/qr_code_scanner-24px.svg'));
  }

  ngOnInit() {
  }

  goPremium(options: MatListOption[]) {
    const {value} = options[0];
    switch (value) {
      case 'enzonaDirect': {
        this.loaderService.show();
        this.paymentService.getItems().subscribe((data: any) => {
          if (data.results.length) {
            const offer = data.results[0];
            const payment = {
              amount: offer.price,
              currency: 'cup',
              description: offer.description,
              ticket: offer.ticket
            };
            this.paymentService.createPayment(payment).subscribe((res: any) => {
              const {link_confirm} = res;
              // this.loaderService.hide();
              if (isPlatformBrowser(this.platformId)) {
              window.open(link_confirm, '_self');
              }
            }, error => {
              this.loaderService.hide();
              return throwError(error);
            });
          }
        });
        /*const payment = {
          name: 'Usuario Premium de Picta',
          description: 'Usuario Premium de Picta',
          quantity: 1,
          price: 1.00,
          tax: 0.00
        };*/

        break;
      }
      case 'enzonaQR': {
        this.paymentService.getItems().subscribe((data: any) => {
          if (data.results.length) {
            const offer = data.results[0];
            const payment = {
              amount: offer.price,
              currency: 'cup',
              description: offer.description,
              ticket: offer.ticket
            };
            this.paymentService.createQR(payment).subscribe((res: any) => {
              const {image, qr_code, ticketQr} = res;
              this.ticket = ticketQr;
              this.generatedQRData = 'data:image/png;base64,' + image;
              this.paymentStepper().next();
            });
          }
        });

        break;
      }
    }
  }

  checkTicket() {
    const params = {
      ticket: this.ticket,
      seller: this.data.user
    };
    this.paymentService.checkTicket(params).subscribe((data: any) => {
      if (data.results.length) {
        this.dialog.open(PaymentDetailsComponent, {
          minWidth: '320px',
          data: {
            payment: data.results[0]
          }
        });
      } else {
        this.snackBar.open('No se detectaron pagos con este código QR');
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
    const headerContainer = document.querySelector('.mat-horizontal-stepper-header-container ');
    const childArray = Array.from(headerContainer.childNodes);
    childArray.slice(5).forEach(node => node.remove());
  }

  showPaymentList() {
    const params = {
      seller: this.data.user
    };
    this.loaderService.show();
    this.paymentService.checkTicket(params).subscribe((data: any) => {
      this.loaderService.hide();
      if (data.results.length) {
        this.dialog.open(PaymentListComponent, {
          minWidth: '360px',
          data: {
            payments: data.results,
            user: this.data.user,
          }
        });
      } else {
        this.snackBar.open('No han realizado pagos anteriores');
      }
    });
  }
}
