import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiMessage, CreateQueryRequest, Enquiry } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  submitEnquiry(request: CreateQueryRequest): Observable<ApiMessage> {
    return this.http.post<ApiMessage>('/api/queries', request, { withCredentials: true });
  }

  login(username: string, password: string): Observable<ApiMessage> {
    return this.http.post<ApiMessage>('/api/admin/login', { username, password }, { withCredentials: true });
  }

  session(): Observable<{ authenticated: boolean }> {
    return this.http.get<{ authenticated: boolean }>('/api/admin/session', { withCredentials: true });
  }

  logout(): Observable<ApiMessage> {
    return this.http.post<ApiMessage>('/api/admin/logout', {}, { withCredentials: true });
  }

  getQueries(): Observable<Enquiry[]> {
    return this.http.get<Enquiry[]>('/api/admin/queries', { withCredentials: true });
  }

  deleteQuery(id: number): Observable<ApiMessage> {
    return this.http.delete<ApiMessage>(`/api/admin/queries/${id}`, { withCredentials: true });
  }
}
