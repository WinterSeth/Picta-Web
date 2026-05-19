import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  signal,
  input,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { modalScaleInAnimation } from '../../../../animations/dialogs';

export interface RepartoActor {
  id: number;
  nombre: string;
  imagen?: string;
  url_avatar?: string;
  slug?: string;
}

export interface RepartoExplorerDialogData {
  title: string;
  actores: RepartoActor[];
}

@Component({
  selector: 'app-reparto-explorer-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reparto-explorer-dialog.component.html',
  styleUrls: ['./reparto-explorer-dialog.component.scss'],
  animations: [modalScaleInAnimation],
  host: {
    '[@modalScaleIn]': '',
  },
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogTitle,
    MatDialogContent,
    NgOptimizedImage,
    RouterLink,
  ],
})
export class RepartoExplorerDialogComponent {
  readonly data = inject<RepartoExplorerDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject<MatDialogRef<RepartoExplorerDialogComponent>>(MatDialogRef);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly columns = signal(3);

  getActorSlug(actor: RepartoActor): string[] {
    const slug = actor.slug;
    if (slug) {
      return ['/actor', slug];
    }
    if (actor.nombre) {
      return ['/actor', actor.nombre];
    }
    return [];
  }

  hasActorSlug(actor: RepartoActor): boolean {
    return !!actor.nombre;
  }

  navigateAndClose(): void {
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}