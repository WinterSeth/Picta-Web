import { Component, OnInit, inject } from '@angular/core';

import { finalize, tap } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatIconRegistry, MatIcon } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDivider } from '@angular/material/divider';
import { MatNavList, MatListItem } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { MatAnchor } from '@angular/material/button';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { CardComponent } from '../card/card.component';
import { CountdownTimerComponent } from '../../profile/components/countdown-timer/countdown-timer.component';
import { SuscripcionService } from '../../profile/services/suscripcion.service';
import { AuthService } from '../../../../../services/auth.service';
import { PaymentService } from '../../profile/services/payment.service';
import { PayItemComponent } from '../../common-components/components/pay-item/pay-item.component';


interface Beneficio {
  nombre: string;
  valor: string;
  precio: string;
}
interface Plan {
  id: number;
  nombre: string;
  precio: string;
  duracion: number;
  beneficios_info: Beneficio[];
  descripcion?: string;
  activo?: boolean;
  pago?: boolean;
  externalId?: string;
}

interface DataPlan extends Plan {
  capacidad: string;
  vigencia: string;
  acumulable: boolean;
}

const THUMBUP_ICON =
  `
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48Z" fill="url(#paint0_linear)"/>
<path d="M8.93822 25.174C11.7438 23.6286 14.8756 22.3388 17.8018 21.0424C22.836 18.919 27.8902 16.8324 32.9954 14.8898C33.9887 14.5588 35.7734 14.2351 35.9484 15.7071C35.8526 17.7907 35.4584 19.8621 35.188 21.9335C34.5017 26.4887 33.7085 31.0283 32.935 35.5685C32.6685 37.0808 30.774 37.8637 29.5618 36.8959C26.6486 34.9281 23.713 32.9795 20.837 30.9661C19.8949 30.0088 20.7685 28.6341 21.6099 27.9505C24.0093 25.5859 26.5539 23.5769 28.8279 21.0901C29.4413 19.6088 27.6289 20.8572 27.0311 21.2397C23.7463 23.5033 20.5419 25.9051 17.0787 27.8945C15.3097 28.8683 13.2479 28.0361 11.4797 27.4927C9.89428 26.8363 7.57106 26.175 8.93806 25.1741L8.93822 25.174Z" fill="white"/>
<defs>
<linearGradient id="paint0_linear" x1="18.0028" y1="2.0016" x2="6.0028" y2="30" gradientUnits="userSpaceOnUse">
<stop stop-color="#37AEE2"/>
<stop offset="1" stop-color="#1E96C8"/>
</linearGradient>
</defs>
</svg>
`;

@Component({
    selector: 'app-suscripciones',
    templateUrl: './suscripciones.component.html',
    styleUrls: ['./suscripciones.component.scss'],
    animations: [
        trigger("fadeIn", [
            transition(":enter", [
                style({ opacity: 0 }),
                animate("100ms", style({ opacity: 1 })),
            ]),
            transition(":leave", [animate("100ms", style({ opacity: 0 }))]),
        ]),
    ],
    imports: [
        MatProgressSpinner,
        MatIcon,
        MatAnchor,
      MatButton,
      MatDivider,
        RouterLink,
        MatNavList,
        MatListItem,
        MatTabsModule,
        CardComponent
    ]
})

export class SuscripcionesComponent implements OnInit{
  private suscripcionService = inject(SuscripcionService);
  private authService = inject(AuthService);
  private paymentService = inject(PaymentService);
  private dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);

  plans: Plan[] = [];
  dataPlans: DataPlan[] = [
    {
      id: 49,
      nombre: 'Paquete de datos Picta',
      precio: '400',
      duracion: 35,
      beneficios_info: [
        { nombre: 'Capacidad', valor: '25 GB', precio: '400' },
        { nombre: 'Vigencia', valor: '35 días', precio: '400' },
        { nombre: 'Uso', valor: 'Para la plataforma Picta', precio: '400' },
      ],
      descripcion: 'Paquete de datos acumulable para uso dentro de la plataforma Picta, con prioridad visual premium.',
      activo: false,
      pago: false,
      externalId: 'pago_suscripcion_49',
      capacidad: '25 GB',
      vigencia: '35 días',
      acumulable: true,
    },
  ];
  selectedTabIndex = 0;
  loading = true;
  benefits: [];
  url = {
    label: "Beneficios",
    path: "/subscribe/benefits",
    icon: "apps_outage",
  };

  buyed: any;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);
 
    iconRegistry.addSvgIconLiteral('telegram', sanitizer.bypassSecurityTrustHtml(THUMBUP_ICON));
  }

  ngOnInit(): void {
    this.loadData();
  }

  // Método para manejar el evento de pago exitoso
  onPaymentSuccess() {    
    this.loadData(); // Actualizar la lista de planes
  }

  // Método para manejar el evento de pago exitoso
  onCancelSuccess() {    
    this.loading = true; // Actualizar la lista de planes
  }

  loadData() {
    this.loading = true;
    this.suscripcionService
      .getAllPlans()
      .pipe(
        tap((data: any) => {
          this.plans = data.results.sort((a, b) => a.precio - b.precio);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe( response => {
        this.buyed = response.results.find(
          (plan) => plan.activo === true
        ); 
        if(this.buyed){
          this.getUserData();
        }
      } );
  }

  isCurrent(plan: any): boolean {
    return !!plan && !!this.buyed && plan.id === this.buyed.id;
  }

  isRecommended(plan: any): boolean {
    if (!plan) {
      return false;
    }

    const name = (plan.nombre || '').toLowerCase();
    return plan.id === 40 || name.includes('premium');
  }

  sortedPlans(): any[] {
    if (!this.plans?.length) {
      return [];
    }

    const priority = (plan: any): number => {
      if (this.isCurrent(plan)) {
        return 0;
      }
      if (this.isRecommended(plan)) {
        return 1;
      }
      return 2;
    };

    return [...this.plans].sort((a, b) => {
      const pa = priority(a);
      const pb = priority(b);
      if (pa !== pb) {
        return pa - pb;
      }
      return Number(a?.precio || 0) - Number(b?.precio || 0);
    });
  }

  sortedDataPlans(): DataPlan[] {
    return this.dataPlans;
  }

  openDataPlanPayment(plan: DataPlan) {
    const externalId = plan.externalId || `pago_suscripcion_${plan.id}`;

    this.paymentService.getItem({ external_id: externalId }).subscribe((data: any) => {
      if (data.results.length) {
        const offer = data.results[0];
        const dialogRef = this.dialog.open(PayItemComponent, {
          closeOnNavigation: true,
          hasBackdrop: true,
          panelClass: 'picta-pay-dialog',
          backdropClass: 'picta-pay-backdrop',
          width: '92vw',
          maxWidth: '980px',
          maxHeight: '90vh',
          data: {
            video: plan,
            offer,
            externalId,
          },
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result === 'payment-successful') {
            this.onPaymentSuccess();
            this.snackbar.open('Pago realizado satisfactoriamente');
          }
        });
      } else {
        this.snackbar.open('No existe una oferta para este paquete de datos');
      }
    });
  }

  getUserData(){
    this.authService.getUserData().subscribe((res: any) => {
      this.authService.setUserData(res);
    })
  }

}
