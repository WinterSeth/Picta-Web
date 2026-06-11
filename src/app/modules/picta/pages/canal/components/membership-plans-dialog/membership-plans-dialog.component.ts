import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { PlanService, Plan } from '../../../../../../services/plan.service';
import { PaymentService } from '../../../profile/services/payment.service';
import { NotificationService } from '../../../../../../services/notification.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-membership-plans-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIcon,
    MatButton,
    MatProgressSpinner
  ],
  template: `
    <div class="dialog-header">
      <div class="header-icon">
        <mat-icon>workspace_premium</mat-icon>
      </div>
      <h2 class="header-title">Planes de Membresía</h2>
      <p class="header-subtitle">Desbloquea contenido exclusivo de tus canales favoritos</p>
    </div>

    <div class="dialog-content">
      @if (loading()) {
        <div class="loading-state">
          <mat-spinner [diameter]="36" color="accent"></mat-spinner>
          <p>Cargando planes...</p>
        </div>
      } @else if (plans().length === 0) {
        <div class="empty-state">
          <mat-icon class="empty-icon">info</mat-icon>
          <p>No hay planes disponibles en este momento</p>
        </div>
      } @else {
        <div class="plans-grid">
          @for (plan of plans(); track plan.id; let i = $index) {
            <div 
              class="plan-card"
              [class.plan-featured]="i === 0"
              (click)="selectPlan(plan)">
              
              <div class="card-accent"></div>
              
              <div class="card-content">
                <div class="card-top">
                  <span class="plan-type-badge">
                    {{ plan.internacional ? 'Internacional' : 'Nacional' }}
                  </span>
                  <span class="plan-duration">{{ plan.duracion }} días</span>
                </div>

                <h3 class="plan-name">{{ plan.nombre }}</h3>
                
                <p class="plan-description">{{ plan.descripcion }}</p>

                <div class="plan-price-section">
                  <span class="currency">{{ plan.moneda }}</span>
                  <span class="amount">{{ plan.precio }}</span>
                </div>

                <div class="plan-features">
                  <div class="feature-item">
                    <mat-icon class="feature-icon">check_circle</mat-icon>
                    <span>Acceso completo</span>
                  </div>
                  <div class="feature-item">
                    <mat-icon class="feature-icon">check_circle</mat-icon>
                    <span>Sin anuncios</span>
                  </div>
                  <div class="feature-item">
                    <mat-icon class="feature-icon">check_circle</mat-icon>
                    <span>Contenido exclusivo</span>
                  </div>
                </div>
              </div>

              <div class="card-action">
                <button 
                  mat-flat-button 
                  class="select-btn"
                  (click)="selectPlan(plan); $event.stopPropagation()">
                  <span>Seleccionar</span>
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <div class="dialog-footer">
      <button mat-button (click)="dialogRef.close()" class="close-btn">
        Cerrar
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      color: white;
    }

    /* Header */
    .dialog-header {
      text-align: center;
      padding: 20px 20px 16px;
      background: linear-gradient(135deg, rgba(243, 230, 40, 0.1) 0%, rgba(232, 70, 46, 0.1) 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .header-icon {
      width: 44px;
      height: 44px;
      margin: 0 auto 12px;
      background: linear-gradient(135deg, #f3e628 0%, #e8c520 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 16px rgba(243, 230, 40, 0.3);
    }

    .header-icon mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: #1a1a2e;
    }

    .header-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 6px 0;
      color: #ffffff;
      letter-spacing: -0.02em;
    }

    .header-subtitle {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.6);
      margin: 0;
      line-height: 1.4;
    }

    /* Content */
    .dialog-content {
      padding: 16px;
      max-height: 60vh;
      overflow-y: auto;
      
      /* Scrollbar personalizada */
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(243, 230, 40, 0.4);
        border-radius: 3px;
        transition: background 0.2s ease;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: rgba(243, 230, 40, 0.6);
      }

      /* Firefox */
      scrollbar-width: thin;
      scrollbar-color: rgba(243, 230, 40, 0.4) rgba(255, 255, 255, 0.05);
    }

    .loading-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      gap: 12px;
      color: rgba(255, 255, 255, 0.6);
    }

    .empty-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: rgba(255, 255, 255, 0.3);
    }

    /* Plans Grid */
    .plans-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Plan Card */
    .plan-card {
      position: relative;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .plan-card:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(243, 230, 40, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    .plan-card.plan-featured {
      border-color: rgba(243, 230, 40, 0.3);
      background: linear-gradient(135deg, rgba(243, 230, 40, 0.08) 0%, rgba(232, 70, 46, 0.05) 100%);
    }

    .card-accent {
      height: 3px;
      background: linear-gradient(90deg, #f3e628 0%, #e8462e 100%);
    }

    .card-content {
      padding: 14px;
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .plan-type-badge {
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 3px 8px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.8);
    }

    .plan-duration {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.5);
    }

    .plan-name {
      font-size: 1rem;
      font-weight: 700;
      margin: 0 0 6px 0;
      color: #ffffff;
    }

    .plan-description {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
      margin: 0 0 12px 0;
      line-height: 1.4;
    }

    .plan-price-section {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 12px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
    }

    .currency {
      font-size: 0.8rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.6);
    }

    .amount {
      font-size: 1.5rem;
      font-weight: 800;
      color: #f3e628;
      line-height: 1;
    }

    .plan-features {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .feature-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #37d17c;
    }

    /* Card Action */
    .card-action {
      padding: 0 14px 14px;
    }

    .select-btn {
      width: 100%;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #f3e628 0%, #e8c520 100%);
      color: #1a1a2e;
      font-weight: 600;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .select-btn:hover {
      background: linear-gradient(135deg, #ffe94a 0%, #f3e628 100%);
      box-shadow: 0 4px 12px rgba(243, 230, 40, 0.4);
    }

    .select-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Footer */
    .dialog-footer {
      padding: 12px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: center;
    }

    .close-btn {
      color: rgba(255, 255, 255, 0.6);
      border-radius: 8px;
      font-size: 0.85rem;
    }

    .close-btn:hover {
      color: rgba(255, 255, 255, 0.9);
      background: rgba(255, 255, 255, 0.08);
    }
  `]
})
export class MembershipPlansDialogComponent implements OnInit {
  dialogRef = inject(MatDialogRef<MembershipPlansDialogComponent>);
  private planService = inject(PlanService);
  private paymentService = inject(PaymentService);
  private notificationService = inject(NotificationService);

  plans = signal<Plan[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading.set(true);
    this.planService.getAll({ page_size: 50 })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.plans.set(response.results.filter(plan => plan.visible));
        },
        error: (err) => {
          console.error('Error loading plans:', err);
          this.notificationService.open('error', 'Error al cargar los planes');
        }
      });
  }

  selectPlan(plan: Plan): void {
    const externalId = `suscripcion_canal_${plan.id}`;
    
    this.paymentService.getItem({ external_id: externalId }).subscribe({
      next: (data: any) => {
        if (data.results.length) {
          this.dialogRef.close({ plan, offer: data.results[0], externalId });
        } else {
          this.notificationService.open('error', 'No existe una oferta para este plan');
        }
      },
      error: (err) => {
        console.error('Error getting payment item:', err);
        this.notificationService.open('error', 'Error al procesar el pago');
      }
    });
  }
}
