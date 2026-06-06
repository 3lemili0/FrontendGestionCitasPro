import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_CONFIG } from '../../api.config';
import { AuthResponse, Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}/auth`;
  private usuarioActualSubject = new BehaviorSubject<Usuario | null>(this.obtenerUsuario());
  public usuarioActual$ = this.usuarioActualSubject.asObservable();

  registrar(datosUsuario: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/registro`, datosUsuario);
  }

  login(credenciales: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credenciales).pipe(
      tap(response => {
        this.guardarSesion(response);
      })
    );
  }

  guardarSesion(authResponse: AuthResponse): void {
    localStorage.setItem('authToken', authResponse.token);
    localStorage.setItem('usuario', JSON.stringify(authResponse.usuario));
    this.usuarioActualSubject.next(authResponse.usuario);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('authToken');
  }

  obtenerUsuario(): Usuario | null {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  isLoggedIn(): boolean {
    return !!this.obtenerToken();
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario');
    this.usuarioActualSubject.next(null);
  }
}