import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface ShareDialogData {
  slugUrl: string;
  title: string;
}

@Component({
    selector: 'app-share-dialog',
    imports: [MatIconModule, MatDialogModule, MatButtonModule, MatSnackBarModule],
    templateUrl: './share-dialog.component.html',
    styleUrl: './share-dialog.component.scss'
})
export class ShareDialogComponent {
   dialogRef = inject<MatDialogRef<ShareDialogComponent>>(MatDialogRef);
   data = inject<ShareDialogData>(MAT_DIALOG_DATA);
   private snackBar = inject(MatSnackBar);

   shareUrl: string;

   /** Inserted by Angular inject() migration for backwards compatibility */
   constructor(...args: unknown[]);

  constructor() {
    const data = this.data;

    this.shareUrl = `https://www.picta.cu/short/${data.slugUrl}`;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  shareOnWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(`Mira este short: ${this.data.title} - ${this.shareUrl}`)}`;
    this.openShareWindow(url, 600, 600);
  }

  shareOnFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.shareUrl)}`;
    this.openShareWindow(url, 600, 400);
  }

  shareOnTwitter() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Mira este short: ${this.data.title}`)}&url=${encodeURIComponent(this.shareUrl)}`;
    this.openShareWindow(url, 600, 300);
  }

  shareByEmail() {
    const subject = `Mira este short: ${this.data.title}`;
    const body = `Te comparto este short: ${this.data.title}\n\n${this.shareUrl}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  }

  shareOnTelegram() {
    const url = `https://t.me/share/url?url=${encodeURIComponent(this.shareUrl)}&text=${encodeURIComponent(`Mira este short: ${this.data.title}`)}`;
    this.openShareWindow(url, 600, 500);
  }

  shareOnKakaoTalk() {
    // KakaoTalk requiere SDK especial, aquí un enlace básico
    const url = `kakaolink://send?url=${encodeURIComponent(this.shareUrl)}&text=${encodeURIComponent(this.data.title)}`;
    window.open(url, '_blank');
  }

  async copyLink() {
    try {
      await navigator.clipboard.writeText(this.shareUrl);
      this.snackBar.open('Enlace copiado al portapapeles', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    } catch (err) {
      console.error('Error al copiar el enlace: ', err);
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = this.shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      this.snackBar.open('Enlace copiado', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }
  }

  private openShareWindow(url: string, width: number, height: number) {
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    window.open(url, 'compartir', `width=${width},height=${height},left=${left},top=${top}`);
    this.dialogRef.close();
  }

}
