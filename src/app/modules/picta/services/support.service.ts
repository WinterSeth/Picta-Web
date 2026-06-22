import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, catchError, throwError, tap } from 'rxjs';

export interface SupportUser {
  id?: number;
  username?: string;
  email?: string;
  phone_number?: string;
}

export interface IssueInteraction {
  id: number;
  message: string;
  image?: string | null;
  created_at: string;
  updated_at: string;
  issue: number;
  user: number;
}

export interface IssueReport {
  id: number;
  issue_type: 'bug' | 'performance' | 'payment' | 'ui' | 'other';
  title: string;
  description: string;
  image?: string;
  issue_state: 'pending' | 'reviewing' | 'resolved';
  created_at: string;
  updated_at: string;
  user: SupportUser | number;
  interactions?: IssueInteraction[];
}

export interface IssueReportResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IssueReport[];
}

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrlv3}/issuereport/`;
  private interactionsApiUrl = `${environment.baseUrlv3}/interact/`;

  // Signals for state management
  public reports = signal<IssueReport[]>([]);
  public isLoading = signal<boolean>(false);

  getReports(): Observable<IssueReportResponse> {
    this.isLoading.set(true);
    return this.http.get<IssueReportResponse>(this.apiUrl).pipe(
      tap({
        next: (response) => {
          this.reports.set(response.results);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }
  createReport(data: FormData): Observable<IssueReport> {
    return this.http.post<IssueReport>(this.apiUrl, data);
  }

  createInteraction(reportId: number, data: FormData): Observable<IssueInteraction> {
    return this.http.post<IssueInteraction>(`${this.apiUrl}${reportId}/interact/`, data).pipe(
      catchError((nestedError) => {
        return this.http.post<IssueInteraction>(this.interactionsApiUrl, data).pipe(
          catchError(() => throwError(() => nestedError))
        );
      })
    );
  }
}
