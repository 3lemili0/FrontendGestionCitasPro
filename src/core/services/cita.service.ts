import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../api.config';
import { AuthService } from './auth.service';
import { Cita } from '../models/cita.model';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${API_CONFIG.baseUrl}/citas`;

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getMisCitas(): Observable<Cita[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Cita[]>(`${this.apiUrl}/mis-citas`, { headers });
  }

  getClientes(): Observable<Usuario[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Usuario[]>(`${API_CONFIG.baseUrl}/profesionales`, { headers });
  }

  reservarCita(datosCita: { profesionalId: string, fecha: string, motivo: string }): Observable<Cita> {
    const headers = this.getAuthHeaders();
    return this.http.post<Cita>(`${this.apiUrl}/reservar`, datosCita, { headers });
  }

  crearCitaManual(datosCita: { clienteId: string, fecha: string, motivo: string }): Observable<Cita> {
    const headers = this.getAuthHeaders();
    return this.http.post<Cita>(`${this.apiUrl}/manual`, datosCita, { headers });
  }

  actualizarCita(citaId: string, datosCita: { fecha: string, motivo: string }): Observable<Cita> {
    const headers = this.getAuthHeaders();
    return this.http.put<Cita>(`${this.apiUrl}/${citaId}`, datosCita, { headers });
  }

  cancelarCita(citaId: string): Observable<Cita> {
    const headers = this.getAuthHeaders();
    return this.http.patch<Cita>(`${this.apiUrl}/${citaId}/cancelar`, {}, { headers });
  }
}