import { Component, OnInit, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { SuscripcionService } from '../../../services/suscripcion.service';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe, DecimalPipe } from '@angular/common';

interface SubscriptionPlan {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  duracion?: number;
}

interface SubscriptionItem {
  id: number;
  plan?: SubscriptionPlan;
  fecha_inicio?: string;
  fecha_fin?: string;
  gateway?: string;
  estado?: string;
  activo?: boolean;
  precio?: number;
}

@Component({
  selector: 'app-suscripciones',
  templateUrl: './suscripciones.component.html',
  styleUrls: ['./suscripciones.component.scss'],
  imports: [RouterLink, DatePipe, DecimalPipe]
})
export class SuscripcionesComponent implements OnInit {
  private suscripcionService = inject(SuscripcionService);
  private snackBar = inject(MatSnackBar);

  loading = true;
  error: string;
  currentPlan: SubscriptionItem;
  history: SubscriptionItem[] = [];
  cancelling = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = null;
    this.suscripcionService
      .getUserSubscriptions()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response: any) => {
          const subscriptions = this.extractSubscriptions(response).filter(item => !!item);
          this.history = subscriptions.sort((a, b) => {
            const first = new Date(a.fecha_inicio || 0).getTime();
            const second = new Date(b.fecha_inicio || 0).getTime();
            return second - first;
          });
          this.currentPlan = this.resolveCurrentPlan(this.history);
        },
        error: () => {
          this.history = [];
          this.currentPlan = null;
          this.error = 'No fue posible cargar el historial de suscripciones.';
        }
      });
  }

  cancelSubscription(): void {
    if (!this.currentPlan?.id || this.cancelling) {
      return;
    }

    this.cancelling = true;
    this.suscripcionService
      .cancelPlan(this.currentPlan.id)
      .pipe(finalize(() => (this.cancelling = false)))
      .subscribe({
        next: () => {
          this.snackBar.open('Suscripción cancelada correctamente.', 'Cerrar', { duration: 3000 });
          this.loadData();
        },
        error: () => {
          this.snackBar.open('No se pudo cancelar la suscripción.', 'Cerrar', { duration: 3500 });
        },
      });
  }

  activePrice(): number | null {
    return this.currentPlan?.precio ?? this.currentPlan?.plan?.precio ?? null;
  }

  daysRemaining(): number | null {
    if (!this.currentPlan?.fecha_fin) {
      return null;
    }

    const end = new Date(this.currentPlan.fecha_fin).getTime();
    const now = Date.now();
    const diff = end - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }

  getStatusLabel(status: string): string {
    const normalized = (status || '').toLowerCase();

    if (['activa', 'activo', 'active', 'vigente'].includes(normalized)) {
      return 'Activa';
    }

    if (['cancelada', 'canceled', 'cancelled'].includes(normalized)) {
      return 'Cancelada';
    }

    if (['expirada', 'expired', 'vencida'].includes(normalized)) {
      return 'Expirada';
    }

    if (['pendiente', 'pending'].includes(normalized)) {
      return 'Pendiente';
    }

    return status || 'Desconocido';
  }

  getStatusClass(status: string): string {
    const normalized = (status || '').toLowerCase();

    if (['activa', 'activo', 'active', 'vigente'].includes(normalized)) {
      return 'status-active';
    }

    if (['cancelada', 'canceled', 'cancelled'].includes(normalized)) {
      return 'status-cancelled';
    }

    if (['expirada', 'expired', 'vencida'].includes(normalized)) {
      return 'status-expired';
    }

    return 'status-pending';
  }

  private extractSubscriptions(response: any): SubscriptionItem[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.results)) {
      return response.results;
    }

    return [];
  }

  private resolveCurrentPlan(items: SubscriptionItem[]): SubscriptionItem {
    const active = items.find(item => {
      const status = (item.estado || '').toLowerCase();
      return item.activo || ['activa', 'activo', 'active', 'vigente'].includes(status);
    });

    // Solo devuelve el plan si está activo
    return active || null;
  }

}
