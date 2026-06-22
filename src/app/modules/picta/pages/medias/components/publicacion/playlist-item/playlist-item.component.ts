import { Component, ElementRef, OnInit, OnDestroy, input, output, viewChild, inject, signal } from '@angular/core';
import { AuthService } from '../../../../../../../services/auth.service';
import { UserModel } from '../../../../../models/user.model';
import { DownloadPopupComponent } from '../../../../../components/download-popup/download-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { Publication } from '../../../models/publicacion.model';
import { MatBadge } from '@angular/material/badge';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { MatButton } from '@angular/material/button';
import { NgOptimizedImage } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-playlist-item',
    templateUrl: './playlist-item.component.html',
    styleUrls: ['./playlist-item.component.scss'],
    imports: [MatIconButton, MatTooltip, MatIcon, MatBadge, NgOptimizedImage, MatButton]
})
export class PlaylistItemComponent implements OnInit, OnDestroy {
    private authService = inject(AuthService);
    private dialog = inject(MatDialog);
    private router = inject(Router);
    private userSub: Subscription | null = null;

    readonly playlist = input<any>(undefined);
    readonly publicacion = input<Publication>(undefined);
    readonly isPlaying = input<boolean>(undefined);
    readonly selectVideo = output<Publication>();
    readonly item = viewChild<ElementRef<HTMLDivElement>>('divElement');
    user: UserModel | null = null;
    isAdmin: boolean;
    listas: any;
    showDownloadUpgradeModal = signal(false);

    ngOnInit() {
        this.userSub = this.authService.user$.subscribe((user: UserModel | null) => {
            if (user) {
                this.user = user;
                this.isAdmin = user.groups?.some((g: any) => g.name === 'Administrador') ?? false;
            } else {
                this.user = null;
                this.isAdmin = false;
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

    playVideo() {
        if (this.publicacion()) {
            this.selectVideo.emit(this.publicacion());
        }
    }

    openDownload() {
        const pub = this.publicacion();
        if (!pub) return;

        // Si tiene el beneficio descargar_listas = Si, abrir dialog de descarga
        if (this.listas === 'Si') {
            this.dialog.open(DownloadPopupComponent, {
                data: { video: pub, user: this.user },
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
        return this.publicacion();
    }

    get showAd() {
        return false;
    }

    get playTime() {
        return 0;
    }

    get precioDescarga() {
        return this.listas === 'Si';
    }
}