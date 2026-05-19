import { Component, OnDestroy, OnInit, input, output, inject, computed } from '@angular/core';
import {ComentarioService} from '../../../../services/comentario.service';
import {UserModel} from '../../../../../../models/user.model';
import {AuthService} from '../../../../../../../../services/auth.service';
import {SubSink} from 'subsink';
import {format, parseISO} from 'date-fns';
import {es} from 'date-fns/locale';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../../../../../components/dialogs/confirm-dialog/confirm-dialog.component';
import {Publication} from '../../../../models/publicacion.model';
import {Comentario} from '../../../../models/comentario.model';
import { Canal } from '../../../../../canal/models/canal.model';
import { CapitalLeadPipe } from '../../../../pipes/capital-lead.pipe';
import { ComentFormComponent } from '../../coment-form/coment-form.component';
import { MatIcon } from '@angular/material/icon';
import { NgOptimizedImage } from '@angular/common';

@Component({
    selector: 'app-coment-box-item',
    templateUrl: './coment-box-item.component.html',
    styleUrls: ['./coment-box-item.component.scss'],
    imports: [NgOptimizedImage, MatIcon, ComentFormComponent, CapitalLeadPipe]
})
export class ComentBoxItemComponent implements OnInit, OnDestroy {
  private comentarioService = inject(ComentarioService);
  authService = inject(AuthService);
  private dialog = inject(MatDialog);

  readonly comentario = input<Comentario>(undefined);
  readonly user = input<UserModel>(undefined);
  readonly canal = input<Canal>(undefined);
  readonly isRespuesta = input(false);
  readonly updated = output();

  showAnswers = false;
  respuestas: [Comentario];
  showComent = false;
  readonly video = input<Publication>(undefined);
  fecha;
  subs = new SubSink();
  editMode = false;
  isTruncated = true;

/** Computed: determina si el comentario es del dueno del canal (autor del video) */
  readonly isOwner = computed(() => {
    const video = this.video();
    const comentario = this.comentario();
    if (!video || !comentario) return false;

    const comentarioUsername: any = (comentario as any)?.usuario?.username;
    if (!comentarioUsername) return false;

    // Comparar con video.usuario.username
    const videoUsuario: any = video?.usuario;
    let videoAutorUsername: any = null;
    if (videoUsuario) {
      if (typeof videoUsuario === 'string') {
        videoAutorUsername = videoUsuario;
      } else if (videoUsuario && typeof videoUsuario === 'object') {
        videoAutorUsername = videoUsuario.username;
      }
    }
    if (comentarioUsername === videoAutorUsername) return true;

    // Comparar con video.canal.usuario.username
    const videoCanalUsuario: any = video?.canal?.usuario;
    let canalDuenoUsername: any = null;
    if (videoCanalUsuario) {
      if (typeof videoCanalUsuario === 'string') {
        canalDuenoUsername = videoCanalUsuario;
      } else if (videoCanalUsuario && typeof videoCanalUsuario === 'object') {
        canalDuenoUsername = videoCanalUsuario.username;
      }
    }
    if (comentarioUsername === canalDuenoUsername) return true;

    return false;
  });

  /** Computed: determina si el comentario es del usuario del canal (para mostrar nombre/avatar del canal) */
  readonly isCanalUser = computed(() => {
    const video = this.video();
    const comentario = this.comentario();
    if (!comentario) return false;

    const comentarioUsername: any = (comentario as any)?.usuario?.username;
    if (!comentarioUsername) return false;

    // Comparar con video.usuario.username
    const videoUsuario: any = video?.usuario;
    let videoAutorUsername: any = null;
    if (videoUsuario) {
      if (typeof videoUsuario === 'string') {
        videoAutorUsername = videoUsuario;
      } else if (videoUsuario && typeof videoUsuario === 'object') {
        videoAutorUsername = videoUsuario.username;
      }
    }
    if (comentarioUsername === videoAutorUsername) return true;

    // Comparar con video.canal.usuario.username
    const videoCanalUsuario: any = video?.canal?.usuario;
    let canalDuenoUsername: any = null;
    if (videoCanalUsuario) {
      if (typeof videoCanalUsuario === 'string') {
        canalDuenoUsername = videoCanalUsuario;
      } else if (videoCanalUsuario && typeof videoCanalUsuario === 'object') {
        canalDuenoUsername = videoCanalUsuario.username;
      }
    }
    if (comentarioUsername === canalDuenoUsername) return true;

    return false;
  });

  /** Computed: nombre a mostrar (del canal si es usuario del canal, o del usuario) */
  readonly displayName = computed(() => {
    const video = this.video();
    const comentario = this.comentario();

    if (this.isCanalUser()) {
      if (video?.canal?.nombre) {
        return video.canal.nombre;
      }
    }

    // Default al username del comentario
    const comentarioUsuario: any = comentario?.usuario;
    return typeof comentarioUsuario === 'string' ? comentarioUsuario : comentarioUsuario?.username || '';
  });

  /** Computed: avatar a mostrar (del canal si es usuario del canal, o del usuario) */
  readonly displayAvatar = computed(() => {
    const video = this.video();
    const comentario = this.comentario();

    if (this.isCanalUser()) {
      if (video?.canal?.url_avatar) {
        return video.canal.url_avatar;
      }
    }

    // Default al avatar del comentario
    const comentarioUsuario: any = comentario?.usuario;
    return typeof comentarioUsuario === 'string' ? null : comentarioUsuario?.avatar || null;
  });

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
  }

  ngOnInit() {
    this.fecha = format(parseISO(this.comentario().fecha), 'd LLL y, h:mm aaaa', {locale: es});
  }

  toggleTruncate() {
    this.isTruncated = !this.isTruncated;
  }

  canDelete() {
    return this.user().groups.filter((group: any) => group.name === 'Webmaster' || group.name === 'Administrador').length > 0;
  }

  obtenerRespuestas(idComentario: number) {
    return new Promise<void>((resolve, reject) => {
      if (this.showAnswers) {
        this.showAnswers = false;
        resolve();
      } else {
        this.showAnswers = !this.showAnswers;
        this.subs.add(
          this.comentarioService.obtenerRespuestasDeComentario(idComentario).subscribe((res: any) => {
            this.respuestas = res.results;
            resolve();
          })
        );

      }

    })
  }

  answer() {
    this.showComent = true;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  dismiss($event: any) {
    this.showComent = false;
    this.obtenerRespuestas(this.comentario().id);
  }

  stoppropagation($event: Event) {
    $event.stopPropagation();
  }

  stopPropagation($event: Event) {
    this.stoppropagation($event);
  }

  delete() {
    const dialog = this.dialog.open(ConfirmDialogComponent, {
      role: 'dialog', autoFocus: true, data: {
        msg: '¿Está seguro que desea eliminar este comentario?'
      }
    });
    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.comentarioService.deleteComentario(this.comentario().id).subscribe(() => this.updated.emit());
      }
    });
  }

  edit($event) {
    this.editMode = !this.editMode;
    if ($event) {
      this.updated.emit();
    }
  }

  async actualizar(id) {
    await this.obtenerRespuestas(id);
  }
}
