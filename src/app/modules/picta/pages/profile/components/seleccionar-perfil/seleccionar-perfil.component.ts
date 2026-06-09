import { Component, inject, OnInit, signal, Inject, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Perfil, PerfilesService } from '../../../../../../services/perfiles.service';
import { ActivePerfilService } from '../../../../../../services/active-perfil.service';
import { AuthService } from '../../../../../../services/auth.service';
import { NotificationService } from '../../../../../../services/notification.service';
import { PerfilFormDialogComponent } from '../perfil-form-dialog/perfil-form-dialog.component';

@Component({
  selector: 'app-seleccionar-perfil',
  standalone: true,
  imports: [MatIcon, MatDialogModule],
  template: `
    <div class="flex flex-col items-center justify-center p-6 pb-8 relative"
         [class.min-h-screen]="!isDialog"
         [style.min-height]="isDialog ? 'auto' : '100vh'"
         [style.background]="isDialog 
          ? 'transparent' 
          : 'linear-gradient(180deg, rgba(10, 17, 38, 1) 0%, rgba(16, 25, 53, 1) 100%)'">
      
      <!-- Close Button (dialog mode) -->
      @if (isDialog && dialogRef) {
        <button (click)="dialogRef.close()" 
                class="absolute top-3 right-3 z-10 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Cerrar">
          <mat-icon class="text-2xl">close</mat-icon>
        </button>
      }

      <!-- Logout Button (page mode) -->
      @if (!isDialog) {
        <div class="absolute top-4 right-4 md:top-8 md:right-8 z-10">
          <button (click)="logout()" 
                  class="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors border border-white/10 text-sm group"
                  style="background: rgba(255,255,255,0.07);">
            <mat-icon class="text-xl">logout</mat-icon>
            <span class="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      }

      <div class="w-full text-center mb-6">
        <h1 class="text-3xl md:text-4xl font-bold text-white mb-2" style="font-family: var(--picta-font-primary, sans-serif);">
          ¿Quién está viendo?
        </h1>
        @if (!loading() || profiles().length > 0) {
          <p class="text-base" style="color: var(--picta-text-muted);">
            Selecciona tu perfil para continuar
          </p>
        }
      </div>

      <!-- Loading inicial: skeleton -->
      @if (loading() && profiles().length === 0) {
        <div class="flex flex-wrap justify-center gap-4 md:gap-6">
          @for (i of [1,2,3,4]; track i) {
            <div class="flex flex-col items-center p-3">
              <div class="w-20 h-20 md:w-24 md:h-24 mb-3 rounded-full animate-pulse"
                   style="background: rgba(255,255,255,0.1);"></div>
              <div class="w-16 h-5 rounded animate-pulse" style="background: rgba(255,255,255,0.1);"></div>
            </div>
          }
        </div>
      } 
<!-- Seleccionando perfil: mostrar solo perfil seleccionado -->
      @else if (loading()) {
        @for (profile of profiles(); track profile.id) {
          @if (profile.id === selectedProfileId) {
            <div class="center-loading flex flex-col items-center justify-center py-8">
              <div class="relative w-24 h-24 md:w-28 md:h-28 mb-4 rounded-full flex items-center justify-center loading-circle"
                   style="background: linear-gradient(135deg, #f3e628 0%, #d4c724 100%);">
                <div class="w-full h-full rounded-full flex items-center justify-center"
                     style="background: rgba(10, 17, 38, 1);">
                  <span class="text-4xl md:text-5xl font-bold text-white">
                    {{ (profile.nombre || '').charAt(0).toUpperCase() }}
                  </span>
                </div>
              </div>
              <span class="text-xl md:text-2xl font-bold text-white mb-2">
                {{ profile.nombre }}
              </span>
              <span class="text-base animate-pulse" style="color: var(--picta-yellow);">
                Entrando con {{ profile.nombre }}...
              </span>
            </div>
          }
        }
      }
<!-- Mostrar todos los perfiles -->
      @else {
        <div class="flex flex-wrap justify-center gap-6 md:gap-8">
          @for (profile of profiles(); track profile.id) {
            <div class="profile-card group relative flex flex-col items-center py-4 px-3 rounded-2xl transition-all duration-250"
                 [class.profile-active]="activeProfileId === profile.id"
                 [class.profile-principal]="profile.clasificacion === 'PRINCIPAL'">
               
               <!-- Actions Menu (visible on hover) - Solo para no principales -->
               @if (profile.clasificacion !== 'PRINCIPAL') {
                 <div class="absolute -top-3 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-20">
                   <button (click)="editProfile(profile)" 
                           class="action-btn"
                           aria-label="Editar perfil">
                     <mat-icon class="text-base">edit</mat-icon>
                   </button>
                   @if (profile.id !== activeProfileId) {
                     <button (click)="deleteProfile(profile)" 
                             class="action-btn action-btn-danger"
                             aria-label="Eliminar perfil">
                       <mat-icon class="text-base">delete</mat-icon>
                     </button>
                   }
                 </div>
               }

               <!-- Select profile button -->
               <button (click)="selectProfile(profile)"
                       class="flex flex-col items-center focus:outline-none"
                       [attr.aria-label]="'Seleccionar perfil ' + profile.nombre">
                 <!-- Profile Circle Container -->
                 <div class="relative mb-3">
                   <!-- Circle -->
                   <div class="profile-avatar w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center"
                       [class.avatar-principal]="profile.clasificacion === 'PRINCIPAL'"
                       [class.avatar-activo]="activeProfileId === profile.id"
                       [class.avatar-secundario]="profile.clasificacion !== 'PRINCIPAL' && activeProfileId !== profile.id">
                     <div class="w-full h-full rounded-full flex items-center justify-center profile-inner">
                       <span class="text-4xl md:text-5xl font-bold text-white">
                         {{ (profile.nombre || '').charAt(0).toUpperCase() }}
                       </span>
                     </div>
                   </div>
                   
                   <!-- Badge: Principal (estrella) - centrado en borde superior -->
                   @if (profile.clasificacion === 'PRINCIPAL') {
                     <div class="badge-principal">
                       <mat-icon class="text-lg">star</mat-icon>
                     </div>
                   }
                   
                   <!-- Badge: Activo (check) - centrado en borde inferior -->
                   @if (activeProfileId === profile.id) {
                     <div class="badge-activo">
                       <mat-icon class="text-lg">check</mat-icon>
                     </div>
                   }
                 </div>

                 <!-- Nombre del perfil -->
                 <span class="profile-name"
                       [class.name-activo]="activeProfileId === profile.id">
                   {{ profile.nombre }}
                 </span>
                 
                 <!-- Badge Infantil -->
                 @if (profile.tipo === 'INFANTIL') {
                   <span class="badge-infantil">Infantil</span>
                 }
               </button>
             </div>
          }

          <!-- Add Profile Button -->
          <div class="profile-card group relative flex flex-col items-center py-4 px-3 rounded-2xl transition-all duration-250 hover:scale-105">
            <button (click)="addProfile()"
                    class="flex flex-col items-center focus:outline-none"
                    aria-label="Añadir nuevo perfil">
              <div class="profile-add-avatar w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-3">
                <mat-icon class="text-4xl md:text-5xl text-white/40">add</mat-icon>
              </div>
              <span class="text-lg md:text-xl font-medium text-white/50">
                Añadir perfil
              </span>
            </button>
          </div>
        </div>

        @if (profiles().length === 0) {
          <div class="text-center py-12">
            <p class="text-base" style="color: var(--picta-text-muted);">
              No tienes perfiles configurados
            </p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host {
      --picta-font-primary: 'Bebas Neue', sans-serif;
      --picta-font-secondary: 'Abel', sans-serif;
      --picta-yellow: #f3e628;
      --picta-yellow-border: rgba(243, 230, 40, 0.28);
      --picta-text-muted: rgba(244, 247, 251, 0.6);
      --picta-yellow-soft: rgba(243, 230, 40, 0.12);
      
      --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
      --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* ===============================================
       Profile Card - Minimalista y Elegante
       =============================================== */
    .profile-card {
      min-width: 100px;
    }
    
    .profile-card:hover {
      background: rgba(255, 255, 255, 0.04);
    }
    
    .profile-active {
      background: var(--picta-yellow-soft);
      border: 1px solid var(--picta-yellow-border);
      box-shadow: 0 0 24px rgba(243, 230, 40, 0.15);
    }
    
    /* ===============================================
       Avatar del Perfil
       =============================================== */
    .profile-avatar {
      position: relative;
      transition: transform 250ms var(--ease-out-quart), box-shadow 250ms var(--ease-out-quart);
    }
    
    .profile-card:hover .profile-avatar {
      transform: scale(1.05);
    }
    
    .avatar-principal {
      background: linear-gradient(135deg, #f3e628 0%, #d4c724 100%);
      box-shadow: 0 4px 16px rgba(243, 230, 40, 0.3);
    }
    
    .avatar-activo {
      background: linear-gradient(135deg, #f3e628 0%, #d4c724 100%);
      box-shadow: 0 0 0 2px var(--picta-yellow), 0 4px 20px rgba(243, 230, 40, 0.25);
    }
    
    .avatar-secundario {
      background: linear-gradient(135deg, #e8462e 0%, #c73a26 100%);
      box-shadow: 0 4px 12px rgba(232, 70, 46, 0.2);
    }
    
    .profile-inner {
      background: rgba(10, 17, 38, 0.95);
    }

    /* ===============================================
       Badges Centrados - Minimalistas
       =============================================== */
    .badge-principal {
      position: absolute;
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #f3e628 0%, #d4c724 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(243, 230, 40, 0.4);
      z-index: 10;
    }
    
    .badge-principal mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #0a1126;
    }
    
    .badge-activo {
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 24px;
      background: #0a1126;
      border: 2px solid var(--picta-yellow);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      z-index: 10;
    }
    
    .badge-activo mat-icon {
      font-size: 12px;
      width: 12px;
      height: 12px;
      color: #4ade80;
    }

    /* ===============================================
       Nombre del Perfil
       =============================================== */
    .profile-name {
      font-family: var(--picta-font-secondary);
      font-size: 1rem;
      font-weight: 500;
      color: var(--picta-text-muted);
      transition: color 200ms ease;
      text-align: center;
    }
    
    .name-activo {
      color: var(--picta-yellow);
    }
    
    .profile-card:hover .profile-name {
      color: #f4f7fb;
    }

    /* ===============================================
       Badge Infantil
       =============================================== */
    .badge-infantil {
      font-family: var(--picta-font-secondary);
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.05em;
      color: var(--picta-yellow);
      background: rgba(243, 230, 40, 0.1);
      border: 1px solid var(--picta-yellow-border);
      padding: 2px 10px;
      border-radius: 999px;
      margin-top: 6px;
    }

    /* ===============================================
       Botones de Acción (Editar/Eliminar)
       =============================================== */
    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(10, 17, 38, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 180ms var(--ease-out-quart);
    }
    
    .action-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .action-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #f4f7fb;
      transform: scale(1.1);
    }
    
    .action-btn-danger:hover {
      background: rgba(232, 70, 46, 0.3);
      border-color: rgba(232, 70, 46, 0.5);
      color: #f87171;
    }

    /* ===============================================
       Botón Añadir Perfil
       =============================================== */
    .profile-add-avatar {
      background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
      border: 2px dashed rgba(255, 255, 255, 0.15);
      transition: all 250ms var(--ease-out-quart);
    }
    
    .profile-card:hover .profile-add-avatar {
      border-color: rgba(255, 255, 255, 0.25);
      background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%);
    }

    /* ===============================================
       Animaciones
       =============================================== */
    @keyframes selected-pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.08); }
      100% { transform: scale(1); }
    }

    .center-loading {
      animation: loading-fade-in 400ms var(--ease-out-expo) forwards;
    }

    @keyframes loading-fade-in {
      0% { opacity: 0; transform: scale(0.85) translateY(10px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }

    .loading-circle {
      animation: pulse-glow 1.5s ease-in-out infinite;
    }

    @keyframes pulse-glow {
      0%, 100% { 
        box-shadow: 0 0 0 0 rgba(243, 230, 40, 0.3);
      }
      50% { 
        box-shadow: 0 0 20px 8px rgba(243, 230, 40, 0.15);
      }
    }

    /* ===============================================
       Responsive
       =============================================== */
    @media (max-width: 480px) {
      .profile-card {
        min-width: 80px;
        padding: 8px;
      }
      
      .badge-principal,
      .badge-activo {
        width: 20px;
        height: 20px;
      }
      
      .badge-principal mat-icon,
      .badge-activo mat-icon {
        font-size: 10px;
        width: 10px;
        height: 10px;
      }
    }
  `]
})
export class SeleccionarPerfilComponent implements OnInit {
  private perfilesService = inject(PerfilesService);
  private activePerfilService = inject(ActivePerfilService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  dialogRef = inject(MatDialogRef<SeleccionarPerfilComponent>, { optional: true });
  
  private data = inject(MAT_DIALOG_DATA, { optional: true });
  isDialog = this.data?.isDialog ?? false;
  
activeProfileId = this.activePerfilService.getActiveProfileIdValue();
  
  // Para tracking el perfil seleccionado durante loading
  selectedProfileIdForLoading = signal<number | null>(null);
  get selectedProfileId() { return this.selectedProfileIdForLoading(); }

  profiles = signal<Perfil[]>([]);
  loading = signal(false);
  loadingMessage = signal('');

  ngOnInit(): void {
    if (!this.isDialog && this.activePerfilService.hasActiveProfile()) {
      this.router.navigate(['/']);
      return;
    }
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.loading.set(true);
    this.loadingMessage.set('Cargando perfiles...');
    
    this.perfilesService.getAll().subscribe({
      next: (res: any) => {
        const list = res?.results || res || [];
        this.profiles.set(list);
        this.loading.set(false);

        // Auto-select profile: principal > first > none
        if (list.length === 1) {
          this.selectProfile(list[0]);
        } else if (list.length > 1) {
          const principal = list.find((p: Perfil) => p.clasificacion === 'PRINCIPAL');
          this.selectProfile(principal || list[0]);
        }
      },
      error: (err) => {
        console.error('Error fetching perfiles', err);
        this.loading.set(false);
      }
    });
  }

  selectProfile(profile: Perfil): void {
    if (!profile.id) return;
    
    // Guardar el perfil seleccionado para mostrar en loading
    this.selectedProfileIdForLoading.set(profile.id);
    this.loading.set(true);
    
    this.perfilesService.setActive(profile.id).subscribe({
      next: () => {
        this.activePerfilService.setActiveProfileId(profile.id!);
        this.loading.set(false);
        
        if (this.isDialog && this.dialogRef) {
          this.dialogRef.close();
          setTimeout(() => window.location.reload(), 100);
        } else {
          this.router.navigate(['/']).then(() => {
            window.location.reload();
          });
        }
      },
      error: (err) => {
        console.error('Error setting active profile', err);
        this.notificationService.open('error', 'Error al activar el perfil');
        this.loading.set(false);
      }
    });
  }

  addProfile(): void {
    const dialogRef = this.dialog.open(PerfilFormDialogComponent, {
      panelClass: 'picta-dark-dialog',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createProfile(result);
      }
    });
  }

  editProfile(profile: Perfil): void {
    if (!profile) return;
    
    const dialogRef = this.dialog.open(PerfilFormDialogComponent, {
      panelClass: 'picta-dark-dialog',
      disableClose: true,
      data: { initial: profile }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateProfile(profile.id!, result);
      }
    });
  }

  deleteProfile(profile: Perfil): void {
    if (!profile || !profile.id) return;
    if (profile.id === this.activeProfileId) {
      this.notificationService.open('error', 'No puedes eliminar el perfil activo');
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar el perfil "${profile.nombre}"?`)) {
      return;
    }

    this.loading.set(true);
    this.loadingMessage.set('Eliminando perfil...');

    this.perfilesService.delete(profile.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.notificationService.open('ok', 'Perfil eliminado');
        this.loadProfiles();
      },
      error: (err) => {
        console.error('Error deleting profile', err);
        this.loading.set(false);
        const errorMessage = err.error?.nombre?.[0] || err.error?.non_field_errors?.[0] || 'Error al eliminar el perfil';
        this.notificationService.open('error', errorMessage);
      }
    });
  }

  private createProfile(data: { nombre: string; tipo: string }): void {
    this.loading.set(true);
    this.loadingMessage.set('Creando perfil...');

    const payload = {
      nombre: data.nombre,
      tipo: data.tipo,
      activo: false,
      preferencias: {
        preferencia_generos: [],
        prefencia_canal: [],
        prefencia_interprete: [],
        prefencia_actor: [],
        prefencia_director: []
      }
    };

    this.perfilesService.create(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.notificationService.open('ok', 'Perfil creado correctamente');
        this.loadProfiles();
      },
      error: (err) => {
        console.error('Error creating profile', err);
        this.loading.set(false);
        
        const errorData = err.error;
        let errorMessage = 'Error al crear el perfil';
        
        if (errorData) {
          if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
            errorMessage = errorData.non_field_errors[0];
          } else if (errorData.nombre) {
            errorMessage = Array.isArray(errorData.nombre) ? errorData.nombre[0] : errorData.nombre;
          }
        }
        
        this.notificationService.open('error', errorMessage);
      }
    });
  }

  private updateProfile(id: number | string, data: { nombre: string; tipo: string }): void {
    this.loading.set(true);
    this.loadingMessage.set('Actualizando perfil...');

    const payload = {
      nombre: data.nombre,
      tipo: data.tipo
    };

    this.perfilesService.patch(id, payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.notificationService.open('ok', 'Perfil actualizado');
        this.loadProfiles();
      },
      error: (err) => {
        console.error('Error updating profile', err);
        this.loading.set(false);
        this.notificationService.open('error', 'Error al actualizar el perfil');
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}