import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../../services/notification.service';
import { IssueReport, SupportService } from '../../services/support.service';
import { DatePipe } from '@angular/common';
import { CredentialsService } from '../../services/credentials.service';
import { HelpSupportConversationDialogComponent } from './help-support-conversation-dialog.component';
import { HelpSupportImageDialogComponent } from './help-support-image-dialog.component';

@Component({
  selector: 'app-help-support',
  templateUrl: './help-support.component.html',
  styleUrls: ['./help-support.component.scss'],
  standalone: true,
  imports: [DatePipe, FormsModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule, MatListModule, MatChipsModule, MatDividerModule]
})
export class HelpSupportComponent implements OnInit {
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);
  private credentialsService = inject(CredentialsService);
  private dialog = inject(MatDialog);
  public supportService = inject(SupportService);

  reportForm: FormGroup;
  viewMode: 'create' | 'list' = 'create';
  isSubmitting = false;
  // component-local loading flag isn't used by template; service signals drive UI
  reports: any[] = [];
  selectedFileDataUrl: string | null = null;

  constructor() {
    this.reportForm = this.fb.group({
      issue_type: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  getCurrentUserId(): number | null {
    return this.credentialsService.credentials?.user?.id || null;
  }

  ngOnInit(): void {
    this.loadReports();
  }

  toggleView(mode: 'create' | 'list') {
    this.viewMode = mode;
    if (mode === 'list') {
      this.loadReports();
    }
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFileDataUrl = await this.readFileAsDataUrl(file);
    }
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  openConversation(report: IssueReport) {
    this.dialog.open(HelpSupportConversationDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      panelClass: 'picta-dark-dialog',
      data: {
        report,
        currentUserId: this.getCurrentUserId()
      }
    });
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

  openImageModal(imageUrl: string, title = 'Imagen adjunta') {
    this.dialog.open(HelpSupportImageDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: {
        imageUrl: this.buildSizedImageUrl(imageUrl, 1200, 900),
        title
      }
    });
  }

  onSubmit() {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    if (this.supportService) {
      const formData = new FormData();
      formData.append('issue_type', this.reportForm.value.issue_type);
      formData.append('title', this.reportForm.value.title);
      formData.append('description', this.reportForm.value.description);
      if (this.selectedFileDataUrl) {
        // convert dataURL to blob
        const blob = this.dataUrlToBlob(this.selectedFileDataUrl);
        formData.append('image', blob, 'screenshot.png');
      }

      this.supportService.createReport(formData).subscribe({
        next: (resp: any) => {
          // prepend into service signal so template shows it immediately
          this.supportService.reports.update(prev => [resp, ...prev]);
          // persist to local storage as a fallback cache
          localStorage.setItem('picta_help_reports', JSON.stringify(this.supportService.reports()));
          this.isSubmitting = false;
          this.reportForm.reset();
          this.selectedFileDataUrl = null;
          this.notificationService.open('ok', 'Reporte enviado correctamente');
          // switch view directly without forcing an immediate remote refresh
          this.viewMode = 'list';
        },
        error: () => {
          this.isSubmitting = false;
          this.notificationService.open('error', 'Error al enviar el reporte');
        }
      });
    } else {
      const payload = {
        id: Date.now(),
        issue_type: this.reportForm.value.issue_type,
        title: this.reportForm.value.title,
        description: this.reportForm.value.description,
        image: this.selectedFileDataUrl || null,
        issue_state: 'pending',
        created_at: new Date().toISOString()
      };

      setTimeout(() => {
        // offline/demo fallback: add to service signal so template uses it
        this.supportService.reports.update(prev => [payload as any, ...prev]);
        localStorage.setItem('picta_help_reports', JSON.stringify(this.supportService.reports()));
        this.isSubmitting = false;
        this.reportForm.reset();
        this.selectedFileDataUrl = null;
        this.notificationService.open('ok', 'Reporte enviado correctamente');
        this.viewMode = 'list';
      }, 700);
    }
  }

  loadReports() {
    // rely on service signals for loading and data
    if (this.supportService) {
      this.supportService.isLoading.set(true);
      this.supportService.getReports().subscribe((r: any) => {
        // service will set reports via its tap; persist cache just in case
        localStorage.setItem('picta_help_reports', JSON.stringify(this.supportService.reports()));
      }, () => {
        const raw = localStorage.getItem('picta_help_reports');
        const cached = raw ? JSON.parse(raw) : [];
        this.supportService.reports.set(cached);
        this.supportService.isLoading.set(false);
      });
    } else {
      const raw = localStorage.getItem('picta_help_reports');
      const cached = raw ? JSON.parse(raw) : [];
      this.supportService.reports.set(cached);
      this.supportService.isLoading.set(false);
    }
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

  getIssueTypeLabel(type: string) {
    const map: Record<string, string> = { bug: 'Bug', performance: 'Rendimiento', payment: 'Pago', ui: 'UI/UX', other: 'Otro' };
    return map[type] || type || 'Desconocido';
  }

  getStatusLabel(status: string) {
    const map: Record<string, string> = { pending: 'Pendiente', resolved: 'Resuelta', reviewing: 'En Revisión' };
    return map[status] || status || 'Desconocido';
  }

  getStatusColor(status: string) {
    switch ((status || '').toLowerCase()) {
      case 'resolved': return 'green';
      case 'pending': return 'goldenrod';
      case 'reviewing': return 'dodgerblue';
      default: return 'gray';
    }
  }

  getStatusTextColor(status: string) {
    switch ((status || '').toLowerCase()) {
      case 'pending': return '#1f2937';
      default: return '#ffffff';
    }
  }

}
