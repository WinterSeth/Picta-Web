import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ActivePerfilService } from '../../../../../services/active-perfil.service';
import { Perfil, PerfilesService } from '../../../../../services/perfiles.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-seleccionar-perfil',
  standalone: true,
  imports: [MatIcon, MatProgressSpinner],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 relative"
         style="background: linear-gradient(180deg, rgba(10, 17, 38, 1) 0%, rgba(16, 25, 53, 1) 100%);">
      
      <!-- Logout Button -->
      <div class="absolute top-4 right-4 md:top-8 md:right-8 z-10">
        <button (click)="logout()" 
                class="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors border border-white/10 text-sm group"
                style="background: rgba(255,255,255,0.07);">
          <mat-icon class="text-xl">logout</mat-icon>
          <span class="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </div>

      <div class="w-full max-w-4xl">
        <div class="text-center mb-12">
          <h1 class="text-3xl md:text-5xl font-bold text-white mb-4" style="font-family: var(--picta-font-primary, sans-serif);">
            ¿Quién está viendo?
          </h1>
          <p class="text-lg" style="color: var(--picta-text-muted);">
            Selecciona tu perfil para continuar
          </p>
        </div>

        @if (loading()) {
          <div class="flex flex-col justify-center items-center py-12">
            <mat-spinner [diameter]="48" style="--mdc-circular-progress-active-indicator-color: var(--picta-yellow);"></mat-spinner>
            @if (loadingMessage()) {
              <p class="text-white text-lg font-medium mt-4 animate-pulse">{{ loadingMessage() }}</p>
            }
          </div>
        } @else {
          <div class="flex flex-wrap justify-center gap-8 md:gap-12">
            @for (profile of profiles(); track profile.id) {
              <button (click)="selectProfile(profile)"
                      class="group flex flex-col items-center cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-4 rounded-lg p-2"
                      style="focus: ring-color: var(--picta-yellow); focus: ring-offset-color: rgba(10, 17, 38, 1);"
                      [attr.aria-label]="'Seleccionar perfil ' + profile.nombre"
                      tabindex="0">
                <!-- Profile Circle -->
                <div class="relative w-20 h-20 md:w-28 md:h-28 mb-4 rounded-full flex items-center justify-center transition-all group-hover:shadow-2xl"
                    [style.background]="profile.clasificacion === 'PRINCIPAL' 
                      ? 'linear-gradient(135deg, #f3e628 0%, #d4c724 100%)' 
                      : 'linear-gradient(135deg, #e8462e 0%, #c73a26 100%)'">
                  <div class="w-full h-full rounded-full flex items-center justify-center text-white shadow-inner"
                       style="background: rgba(10, 17, 38, 1);">
                    <span class="text-4xl md:text-5xl font-bold select-none">
                      {{ (profile.nombre || '').charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <!-- Principal Badge -->
                  @if (profile.clasificacion === 'PRINCIPAL') {
                    <div class="absolute -top-2 -right-2 rounded-full p-1"
                         style="background: linear-gradient(135deg, #f3e628 0%, #d4c724 100%);">
                      <mat-icon class="!text-3xl !text-black">star</mat-icon>
                    </div>
                  }
                </div>
                <span class="text-xl md:text-2xl font-bold transition-colors" 
                      style="color: var(--picta-text-muted);"
                      class="group:hover:text-white">
                  {{ profile.nombre }}
                </span>
                @if (profile.tipo === 'INFANTIL') {
                  <span class="text-xs mt-1 px-2.5 py-1 rounded-full border"
                        style="color: var(--picta-text-muted); border-color: var(--picta-yellow-border);">Infantil</span>
                }
              </button>
            }

            <!-- Add Profile Button -->
            <button (click)="addProfile()"
                    class="group flex flex-col items-center cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-4 rounded-lg p-2"
                    style="focus: ring-color: var(--picta-yellow); focus: ring-offset-color: rgba(10, 17, 38, 1);"
                    aria-label="Añadir nuevo perfil"
                    tabindex="0">
              <div class="w-20 h-20 md:w-28 md:h-28 mb-4 rounded-full p-1 flex items-center justify-center"
                   style="background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%); border: 2px dashed rgba(255,255,255,0.2);">
                <div class="w-full h-full rounded-full flex items-center justify-center text-white shadow-inner">
                  <mat-icon class="text-5xl md:text-6xl">add</mat-icon>
                </div>
              </div>
              <span class="text-xl md:text-2xl font-bold transition-colors" 
                    style="color: var(--picta-text-muted);"
                    class="group:hover:text-white">
                Añadir perfil
              </span>
            </button>
          </div>

          @if (profiles().length === 0) {
            <div class="text-center py-12">
              <p class="text-lg mb-6" style="color: var(--picta-text-muted);">
                No tienes perfiles configurados
              </p>
              <p style="color: var(--picta-text-muted);">
                Por favor, contacta con soporte para configurar tu perfil
              </p>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      --picta-font-primary: 'Bebas Neue', sans-serif;
      --picta-font-secondary: 'Abel', sans-serif;
      --picta-yellow: #f3e628;
      --picta-yellow-border: rgba(243, 230, 40, 0.28);
      --picta-text-muted: rgba(244, 247, 251, 0.6);
    }
  `]
})
export class SeleccionarPerfilComponent implements OnInit {
  private perfilesService = inject(PerfilesService);
  private activePerfilService = inject(ActivePerfilService);
  private router = inject(Router);

  profiles = signal<Perfil[]>([]);
  loading = signal(false);
  loadingMessage = signal('');

  ngOnInit(): void {
    // Check if already has active profile
    if (this.activePerfilService.hasActiveProfile()) {
      this.router.navigate(['/']);
      return;
    }

    this.loadProfiles();
  }

  loadProfiles() {
    this.loading.set(true);
    this.loadingMessage.set('Cargando perfiles...');
    
    this.perfilesService.getAll().subscribe({
      next: (res: any) => {
        const list = res?.results || res || [];
        this.profiles.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching perfiles', err);
        this.loading.set(false);
      }
    });
  }

  selectProfile(profile: Perfil) {
    if (!profile.id) return;
    
    this.loading.set(true);
    this.loadingMessage.set(`Activando perfil ${profile.nombre}...`);
    
    this.perfilesService.setActive(profile.id).subscribe({
      next: () => {
        this.activePerfilService.setActiveProfileId(profile.id!);
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error setting active profile', err);
        this.loading.set(false);
      }
    });
  }

  addProfile() {
    // TODO: Show create profile dialog
    // For now, just redirect to profile management
    this.router.navigate(['/profile/perfiles']);
  }

  logout() {
    this.activePerfilService.clearActiveProfile();
    this.router.navigate(['/inicio']);
  }
}