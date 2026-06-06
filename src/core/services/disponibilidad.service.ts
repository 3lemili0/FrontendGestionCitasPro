import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../api.config';
import { AuthService } from './auth.service';
import { Disponibilidad } from '../models/disponibilidad.model';

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${API_CONFIG.baseUrl}/disponibilidad`;

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getMiDisponibilidad(): Observable<Disponibilidad[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Disponibilidad[]>(this.apiUrl, { headers });
  }

  guardarDisponibilidad(disponibilidad: Disponibilidad): Observable<any> { 
    const headers = this.getAuthHeaders();
    return this.http.post(this.apiUrl, disponibilidad, { headers });
  }
}