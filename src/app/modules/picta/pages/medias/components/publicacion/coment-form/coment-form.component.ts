import { Component, OnDestroy, OnInit, input, output, inject } from '@angular/core';
import { UntypedFormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import {ComentarioService} from '../../../services/comentario.service';
import {UserModel} from '../../../../../models/user.model';
import {NotificationService} from '../../../../../../../services/notification.service';
import {SubSink} from 'subsink';
import {LoaderService} from '../../../../../services/loader.service';
import {catchError} from 'rxjs';
import {throwError} from 'rxjs';
import {Publication} from '../../../models/publicacion.model';
import {Comentario} from '../../../models/comentario.model';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatFormField } from '@angular/material/form-field';
import { NgOptimizedImage, UpperCasePipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-coment-form',
    templateUrl: './coment-form.component.html',
    styleUrls: ['./coment-form.component.scss'],
    imports: [NgOptimizedImage, MatFormField, MatInput, ReactiveFormsModule, MatButton, UpperCasePipe, MatProgressSpinner]
})
export class ComentFormComponent implements OnInit, OnDestroy {
  private comentarioService = inject(ComentarioService);
  private notificationService = inject(NotificationService);
  private loaderService = inject(LoaderService);

  comentar: boolean;
  comentBox: UntypedFormControl;
  readonly video = input<Publication>(undefined);
  readonly comentario = input<Comentario>(undefined);
  readonly comentarioId = input<number>(undefined);
  readonly user = input<UserModel>(undefined);
  readonly dismiss = output();
  readonly addComment = output();

  subs = new SubSink();
  mode: 'add' | 'edit' = 'add';

  isSubmiting: boolean = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    this.comentBox = new UntypedFormControl('', Validators.required);
  }

  ngOnInit() {
    const comentario = this.comentario();
    if (comentario) {
      this.comentBox.patchValue(comentario.texto);
      this.mode = 'edit';
    }
  }

  handleCancelComment(didComment?: any) {
    this.comentar = false;
    this.comentBox.reset();
    this.dismiss.emit(didComment);
  }

  stoppropagation($event: Event) {
    $event.stopPropagation();
  }

  handleComment() {
    this.isSubmiting = true;
    if (this.comentBox.value.length > 0) {
      const comentarioId = this.comentarioId();
      if (comentarioId) {
        if (this.mode === 'add') {
          this.loaderService.show();
          this.subs.add(
            this.comentarioService.addRespuesta(this.video().id, this.comentBox.value.toString(), comentarioId).pipe(
              catchError(err => {
                this.loaderService.hide();
                return throwError(err);
              })
            ).subscribe(() => {
              this.loaderService.hide();
              this.notificationService.open('ok', 'Su comentario ha sido enviado.');
              this.handleCancelComment(true);
            })
          );
        } else {
          this.loaderService.show();
          this.subs.add(
            this.comentarioService.updateComentario(this.comentBox.value.toString(), this.comentario().id).pipe(
              catchError(err => {
                this.loaderService.hide();
                return throwError(err);
              })
            ).subscribe(() => {
              this.loaderService.hide();

              this.notificationService.open('ok', 'Su comentario ha sido enviado.');
              this.handleCancelComment(true);
            })
          );
        }
      } else {
        if (this.mode === 'add') {
          this.loaderService.show();
          this.subs.add(
            this.comentarioService.addComment(this.video().id, this.comentBox.value).pipe(
              catchError(err => {
                this.isSubmiting = false;
                this.loaderService.hide();
                return throwError(err);
              })
            ).subscribe(() => {
              this.loaderService.hide();
              this.isSubmiting = false;

              this.addComment.emit();

              this.notificationService.open('ok', 'Su comentario ha sido enviado.');
              this.handleCancelComment(true);
            })
          );
        } else { // Edit Mode
          this.loaderService.show();
          this.subs.add(
            this.comentarioService.updateComentario(this.comentBox.value, this.comentario().id).pipe(
              catchError(err => {
                this.loaderService.hide();
                return throwError(err);
              })
            ).subscribe(() => {
              this.loaderService.hide();
              this.notificationService.open('ok', 'Su comentario ha sido actualizado.');
              this.handleCancelComment(true);
            })
          );
        }
      }
    }

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
