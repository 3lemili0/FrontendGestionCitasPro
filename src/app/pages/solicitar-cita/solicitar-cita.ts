import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { CitaService } from '../../../core/services/cita.service';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-solicitar-cita',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitar-cita.html',
  styleUrls: ['./solicitar-cita.css']
})
export default class SolicitarCitaComponent implements OnInit {
  
  private profesionalService = inject(ProfesionalService);
  private citaService = inject(CitaService);
  private router = inject(Router);

  profesionales: Usuario[] = [];
  profesionalSeleccionadoId: string = '';
  
  fechaSeleccionada: string = '';
  
  horariosManana: string[] = []; // Sin 'ñ'
  horariosTarde: string[] = [];
  
  hayHorariosDisponibles: boolean = false;

  horarioSeleccionado: string | null = null;
  motivoCita: string = '';

  isLoadingProfesionales = true;
  isLoadingHorarios = false;
  isReservando = false;

  ngOnInit(): void {
    const hoy = new Date();
    this.fechaSeleccionada = formatDate(hoy, 'yyyy-MM-dd', 'en-US');

    this.profesionalService.getProfesionales().subscribe({
      next: (data) => {
        this.profesionales = data;
        this.isLoadingProfesionales = false;
      },
      error: (err) => {
        console.error('Error al cargar profesionales', err);
        alert('No se pudo cargar la lista de profesionales.');
        this.isLoadingProfesionales = false;
      }
    });
  }

  onProfesionalChange(): void {
    this.limpiarHorarios();
    if (this.fechaSeleccionada) {
      this.onFechaChange();
    }
  }

  onFechaChange(): void {
    this.limpiarHorarios();
    if (!this.profesionalSeleccionadoId || !this.fechaSeleccionada) {
      return;
    }

    this.isLoadingHorarios = true;

    this.profesionalService.getDisponibilidad(this.profesionalSeleccionadoId, this.fechaSeleccionada).subscribe({
      next: (respuesta) => {
        this.horariosManana = respuesta.horariosDisponibles.filter(h => new Date(h).getHours() < 12);
        this.horariosTarde = respuesta.horariosDisponibles.filter(h => new Date(h).getHours() >= 12);
        this.hayHorariosDisponibles = respuesta.horariosDisponibles.length > 0;
        this.isLoadingHorarios = false;
      },
      error: (err) => {
        console.error('Error al obtener disponibilidad', err);
        alert('No se pudo cargar la disponibilidad para esta fecha.');
        this.isLoadingHorarios = false;
      }
    });
  }

  seleccionarHorario(horario: string): void {
    this.horarioSeleccionado = horario;
  }

  confirmarReserva(): void {
    if (!this.profesionalSeleccionadoId || !this.horarioSeleccionado || !this.motivoCita) {
      alert('Por favor, completa todos los pasos.');
      return;
    }

    this.isReservando = true;
    const datosCita = {
      profesionalId: this.profesionalSeleccionadoId,
      fecha: this.horarioSeleccionado,
      motivo: this.motivoCita
    };

    this.citaService.reservarCita(datosCita).subscribe({
      next: () => {
        alert('¡Cita reservada con éxito!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        alert(`Error al reservar la cita: ${err.error.mensaje || 'Inténtalo de nuevo.'}`);
        this.isReservando = false;
      },
      complete: () => {
        this.isReservando = false;
      }
    });
  }

  private limpiarHorarios(): void {
    this.horariosManana = []; 
    this.horariosTarde = [];
    this.horarioSeleccionado = null;
    this.hayHorariosDisponibles = false;
  }
}