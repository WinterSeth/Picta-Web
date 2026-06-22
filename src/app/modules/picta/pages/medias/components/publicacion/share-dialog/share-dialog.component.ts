import { Component, OnInit, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Publication } from '../../../../medias/models/publicacion.model';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { modalScaleInAnimation } from '../../../../../../picta/animations/dialogs';

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.scss'],
  imports: [MatDialogTitle, MatDialogContent, MatIcon, MatIconButton],
  animations: [modalScaleInAnimation],
})
export class ShareDialogComponent implements OnInit {
  data = inject<{
    video: Publication;
  }>(MAT_DIALOG_DATA);
  dialogRef = inject<MatDialogRef<ShareDialogComponent>>(MatDialogRef);
  private location = inject(Location);

  facebookHref: string;
  twitterHref: string;
  telegramHref: string;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit() {
    this.setHrefs();
  }

  private setHrefs() {
    this.facebookHref = `https://www.facebook.com/sharer/sharer.php?u=https://www.picta.cu${this.location.path()}`;
    this.twitterHref = `https://twitter.com/intent/tweet?text=${this.data.video.nombre} ${this.data.video.url_imagen}&url=https://www.picta.cu${this.location.path()}&original_referer=https://www.picta.cu${this.location.path()}`;
    this.telegramHref = `https://telegram.me/share/url?text=${this.data.video.nombre}&url=https://www.picta.cu${this.location.path()}`;
  }
}
