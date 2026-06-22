import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DownloadPopupComponent } from '../../../../../components/download-popup/download-popup.component';
import { AuthService } from '../../../../../../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { UserModel } from '../../../../../models/user.model';
import { Publication } from '../../../models/publicacion.model';
import { MatBadge } from '@angular/material/badge';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { MatButton } from '@angular/material/button';
import { NgOptimizedImage } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-playlist-mobile',
    templateUrl: './playlist-mobile.component.html',
    styleUrls: ['./playlist-mobile.component.scss'],
    standalone: true,
    imports: [MatIconButton, MatTooltip, MatIcon, MatBadge, NgOptimizedImage, MatButton]
})
export class PlaylistMobileComponent implements OnInit, OnDestroy {
    private router = inject(Router);
    private authService = inject(AuthService);
    private dialog = inject(MatDialog);
    private userSub: Subscription | null = null;

    @Input() playlist: any;
    @Input() publicacion: Publication;
    @Input() isPlaying: boolean;
    @Input() currentVideo;
    @Output() selectVideo = new EventEmitter();
    @Input() opened: any;
    user: UserModel | null = null;
    listas: any;
    showDownloadUpgradeModal = signal(false);

    ngOnInit() {
        this.userSub = this.authService.user$.subscribe((user: UserModel | null) => {
            if (user) {
                this.user = user;
            } else {
                this.user = null;
            }
            this.checkLista();
        });
    }

    ngOnDestroy() {
        this.userSub?.unsubscribe();
    }

    checkLista() {
        // Buscar beneficio con nombre_raw: 'descargar_listas'
        const beneficios = this.user?.subscription_plan?.beneficios as any[] | undefined;
        const beneficioDescargarListas = beneficios?.find(
            (b: any) => b.nombre_raw === 'descargar_listas'
        );
        if (beneficioDescargarListas?.valor) {
            const valor = beneficioDescargarListas.valor.toString().trim().toLowerCase();
            this.listas = valor === 'si' ? 'Si' : 'No';
        } else {
            this.listas = 'No';
        }
    }

    openDownload() {
        if (!this.publicacion) return;

        // Si tiene el beneficio descargar_listas = Si, abrir dialog de descarga
        if (this.listas === 'Si') {
            this.dialog.open(DownloadPopupComponent, {
                data: { video: this.publicacion, user: this.user },
                panelClass: 'picta-dark-dialog',
                backdropClass: 'picta-dialog-backdrop',
                width: 'min(760px, 96vw)',
                maxWidth: '96vw',
                enterAnimationDuration: '380',
                exitAnimationDuration: '300',
            });
        } else {
            // Mostrar modal para upgrade
            this.showDownloadUpgradeModal.set(true);
        }
    }

    closeDownloadUpgradeModal() {
        this.showDownloadUpgradeModal.set(false);
    }

    navigateToSubscriptions() {
        this.closeDownloadUpgradeModal();
        this.router.navigate(['/suscripciones']);
    }

    get video() {
        return this.publicacion;
    }

    get precioDescarga() {
        return this.listas === 'Si';
    }
}