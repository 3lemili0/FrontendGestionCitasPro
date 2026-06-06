import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-registro-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './registro-cliente.html',
  styleUrls: ['./registro-cliente.css']
})
export default class RegistroClienteComponent {
  usuario = {
    nombre: '',
    apellido: '',
    numeroIdentificacion: '',
    correo: '',
    password: '',
    rol: 'cliente', 
    telefono: ''
  };

  private authService = inject(AuthService);
  private router = inject(Router);

  registrar() {
    this.authService.registrar(this.usuario).subscribe({
      next: (response) => {
        console.log('Registro de cliente exitoso', response);
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error en el registro', err);
        const mensajeError = err.error?.mensaje || 'Hubo un error durante el registro.';
        alert(mensajeError);
      }
    });
  }
}