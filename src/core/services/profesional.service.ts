import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../api.config';        
import { AuthService } from './auth.service';             
import { Usuario } from '../models/usuario.model';     

@Injectable({
  providedIn: 'root'
})
export class ProfesionalService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${API_CONFIG.baseUrl}/profesionales`;

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getProfesionales(): Observable<Usuario[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Usuario[]>(this.apiUrl, { headers });
  }

  getDisponibilidad(profesionalId: string, fecha: string): Observable<{ horariosDisponibles: string[] }> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get<{ horariosDisponibles: string[] }>(`${this.apiUrl}/${profesionalId}/disponibilidad`, { headers, params });
  }
}