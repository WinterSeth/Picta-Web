import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '../../../../services/notification.service';
import { IssueInteraction, IssueReport, SupportService } from '../../services/support.service';
import { HelpSupportImageDialogComponent } from './help-support-image-dialog.component';

export interface HelpSupportConversationDialogData {
  report: IssueReport;
  currentUserId: number | null;
}

@Component({
  selector: 'app-help-support-conversation-dialog',
  standalone: true,
  templateUrl: './help-support-conversation-dialog.component.html',
  styleUrls: ['./help-support-conversation-dialog.component.scss'],
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, FormsModule, DatePipe]
})
export class HelpSupportConversationDialogComponent implements OnInit {
  data = inject<HelpSupportConversationDialogData>(MAT_DIALOG_DATA);
  private dialog = inject(MatDialog);
  private supportService = inject(SupportService);
  private notificationService = inject(NotificationService);
  interactions: IssueInteraction[] = [];
  replyMessage = '';
  replyImageDataUrl: string | null = null;
  isSubmitting = false;

  ngOnInit(): void {
    this.interactions = this.getSortedInteractions(this.data.report.interactions || []);
  }

  getSortedInteractions(items: IssueInteraction[]): IssueInteraction[] {
    return [...items]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  isSupportInteraction(interaction: IssueInteraction): boolean {
    if (!this.data.currentUserId) {
      return false;
    }
    return interaction.user !== this.data.currentUserId;
  }

  buildSizedImageUrl(imageUrl: string, width: number, height: number): string {
    if (!imageUrl) {
      return imageUrl;
    }
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    if (/_\d+x\d+(\?.*)?$/.test(imageUrl)) {
      return imageUrl;
    }
    return `${imageUrl}_${width}x${height}`;
  }

  async onReplyFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.replyImageDataUrl = await this.readFileAsDataUrl(file);
      return;
    }
    this.replyImageDataUrl = null;
  }

  clearReplyFile() {
    this.replyImageDataUrl = null;
  }

  canSendReply(): boolean {
    return !!this.replyMessage.trim() || !!this.replyImageDataUrl;
  }

  submitReply() {
    if (!this.canSendReply() || this.isSubmitting) {
      return;
    }

    const data = new FormData();
    data.append('issue', String(this.data.report.id));
    data.append('message', this.replyMessage.trim());

    if (this.replyImageDataUrl) {
      const blob = this.dataUrlToBlob(this.replyImageDataUrl);
      data.append('image', blob, 'reply.png');
    }

    this.isSubmitting = true;
    this.supportService.createInteraction(this.data.report.id, data).subscribe({
      next: (interaction) => {
        this.interactions = this.getSortedInteractions([...this.interactions, interaction]);
        this.supportService.reports.update((prev) => prev.map((existingReport) => {
          if (existingReport.id !== this.data.report.id) {
            return existingReport;
          }
          const existingInteractions = existingReport.interactions || [];
          return {
            ...existingReport,
            interactions: [...existingInteractions, interaction]
          };
        }));
        this.replyMessage = '';
        this.replyImageDataUrl = null;
        this.isSubmitting = false;
        this.notificationService.open('ok', 'Respuesta enviada');
      },
      error: () => {
        this.isSubmitting = false;
        this.notificationService.open('error', 'No se pudo enviar la respuesta');
      }
    });
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private dataUrlToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  openImage(imageUrl: string) {
    this.dialog.open(HelpSupportImageDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: {
        imageUrl: this.buildSizedImageUrl(imageUrl, 1200, 900),
        title: 'Imagen adjunta'
      }
    });
  }
}
