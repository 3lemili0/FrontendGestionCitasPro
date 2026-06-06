import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export default class LoginComponent {
  credenciales = {
    correo: '',
    password: ''
  };

  private authService = inject(AuthService);
  private router = inject(Router);

  login() {
    this.authService.login(this.credenciales).subscribe({
      next: () => {
        console.log('Login exitoso');
        this.router.navigate(['/dashboard']); 
      },
      error: (err) => {
        console.error('Error en el login', err);
        const mensajeError = err.error?.mensaje || 'Hubo un error al iniciar sesión.';
        alert(mensajeError);
      }
    });
  }
}