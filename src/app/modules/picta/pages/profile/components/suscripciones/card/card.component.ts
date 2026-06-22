import { Component, input, output, inject } from "@angular/core";
import { SuscripcionService } from "../../../services/suscripcion.service";
//import { HotToastService } from "@ngneat/hot-toast";
//import { ConfirmDialogComponent } from "../../../../components/common/confirm-dialog/confirm-dialog.component";
import { catchError, finalize, tap } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { trigger, transition, style, animate } from "@angular/animations";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PaymentService } from "../../../services/payment.service";
import { PayItemComponent } from "../../../../common-components/components/pay-item/pay-item.component";
import { HttpErrorResponse } from "@angular/common/http";
import { MatButton } from "@angular/material/button";
import { MatDivider } from "@angular/material/divider";
import { MatIcon } from "@angular/material/icon";
import { NgClass } from "@angular/common";
import { MatTooltip } from "@angular/material/tooltip";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { AuthService } from "../../../../../../../services/auth.service";
import { ConfirmDialogComponent } from "../../../../../components/dialogs/confirm-dialog/confirm-dialog.component";
import { CountdownTimerComponent } from "../../countdown-timer/countdown-timer.component";

@Component({
    selector: "app-card",
    templateUrl: "./card.component.html",
    styleUrls: ["./card.component.scss"],
    animations: [
        trigger("fadeIn", [
            transition(":enter", [
                style({ opacity: 0 }),
                animate("1000ms", style({ opacity: 1 })),
            ]),
            transition(":leave", [animate("1000ms", style({ opacity: 0 }))]),
        ]),
    ],
    imports: [
    MatProgressSpinner,
    MatTooltip,
    MatIcon,
    MatDivider,
    NgClass,
    MatButton
]
})
export class CardComponent {
  private dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);
  private paymentService = inject(PaymentService);
  private suscripcionService = inject(SuscripcionService);
  private authService = inject(AuthService);

  readonly plan = input(undefined);
  readonly buyed = input(undefined);
  benefits: any;
  plans;
  loading = true;
  readonly paymentSuccess = output<void>();

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]); // Evento a emitir

  constructor() {}

  ngOnInit(): void {
    this.benefits = this.order(this.plan().beneficios_info);
    this.loading = false;
  }

  // Método que se llama cuando el pago es exitoso
  onPaymentSuccess() {
    // TODO: The 'emit' function requires a mandatory void argument
    this.paymentSuccess.emit(); // Emite el evento
  }

  openPayment() {
      const externalId = `pago_suscripcion_${this.plan().id}`;
      this.paymentService.getItem({external_id: externalId}).subscribe((data: any) => {
          if (data.results.length) {
            const offer = data.results[0];
            const dialogRef = this.dialog.open(PayItemComponent, {
              closeOnNavigation: true,
              hasBackdrop: true,
              panelClass: 'picta-pay-dialog',
              backdropClass: 'picta-pay-backdrop',
              maxHeight: '90vh',
              data: {
                video: this.plan(),
                offer,
                externalId,
              },
            });
            dialogRef.afterClosed().subscribe(result => {
              if (result === 'payment-successful') {
                this.onPaymentSuccess(); // Emite el evento de pago exitoso
                this.snackbar.open('Pago realizado satisfactoriamente');
              }
            });
          } else {
            this.snackbar.open('No existe una oferta para este plan');
          }
        });
  }

  loadData() {
    this.suscripcionService
      .getAllPlans()
      .pipe(
        tap((data: any) => {
          this.plans = data.results.sort((a, b) => a.precio - b.precio);
        }),
        finalize(() => (
          this.getUserData()
        ))
      )
      .subscribe();
  }

  getUserData(){
    this.authService.getUserData().subscribe((res: any) => {
      this.authService.setUserData(res);
    })
  }

  order(arr) {
    return arr.slice().sort((a, b) => a.nombre_raw.localeCompare(b.nombre_raw));
  }

  cancelPlan(id: number) {
    this.loading = true; // Activar el indicador de carga
  
    this.suscripcionService.cancelPlan(id)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.snackbar.open('Ha ocurrido un error. Intente más tarde.');
          this.loading = false; // Desactivar el indicador de carga en caso de error
          throw err;
        })
      )
      .subscribe({
        next: () => {
          this.loading = false; // Desactivar el indicador de carga
          this.openPayment(); // Abrir el diálogo de pago
        },
        error: () => {
          this.loading = false; // Desactivar el indicador de carga en caso de error
        }
      });
  }

  planUpdates(){
    //this.snackbar.open('Plan cancelado satisfactoriamente');
    this.loadData();
  }

  handleSubscribe(plan: any) {
    let mensaje = `¿Estás seguro que deseas actualizar tu plan actual a ${plan.nombre}? 
    Este cambio será efectivo inmediatamente y no es reversible. 
    Asegúrate de revisar las nuevas características y costos antes de continuar.`;
  
    if (plan.id == this.buyed().id) {
      mensaje = `¿Estás seguro que deseas renovar tu plan ${plan.nombre}? 
      La renovación mantendrá las mismas condiciones y características que tienes actualmente.`;
    }
  
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { msg: mensaje },
      panelClass: ['max-w-md', 'w-full'] // Aplica clases de Tailwind
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //this.cancelPlan(this.buyed.id); //Cancelar Plan
        this.openPayment();
      }
    });
  }
}
