import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DisponibilidadService } from '../../../core/services/disponibilidad.service';
import { Disponibilidad } from '../../../core/models/disponibilidad.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-gestionar-disponibilidad',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gestionar-disponibilidad.html',
  styleUrls: ['./gestionar-disponibilidad.css']
})
export default class GestionarDisponibilidadComponent implements OnInit {
  private disponibilidadService = inject(DisponibilidadService);
  private router = inject(Router);

  dias = [
    { nombre: 'Lunes', valor: 1 },
    { nombre: 'Martes', valor: 2 },
    { nombre: 'Miércoles', valor: 3 },
    { nombre: 'Jueves', valor: 4 },
    { nombre: 'Viernes', valor: 5 },
    { nombre: 'Sábado', valor: 6 },
    { nombre: 'Domingo', valor: 0 }
  ];

  horarios: Disponibilidad[] = [];
  isLoading = true;
  isSaving = false;

  ngOnInit(): void {
    this.isLoading = true;
    this.disponibilidadService.getMiDisponibilidad().subscribe({
      next: (disponibilidadGuardada) => {
        const mapaHorarios = new Map(disponibilidadGuardada.map(h => [h.diaSemana, h]));

        this.horarios = this.dias.map(dia => {
          const horarioGuardado = mapaHorarios.get(dia.valor);

          if (horarioGuardado) {
            return {
              ...horarioGuardado,
              activo: true 
            };
          } else {
            return {
              diaSemana: dia.valor,
              horaInicio: '09:00',
              horaFin: '17:00',
              duracionCita: 30,
              activo: false 
            };
          }
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar disponibilidad', err);
        alert('No se pudo cargar tu configuración. Se mostrará una plantilla por defecto.');
        this.horarios = this.dias.map(dia => ({
          diaSemana: dia.valor,
          horaInicio: '09:00',
          horaFin: '17:00',
          duracionCita: 30,
          activo: (dia.valor > 0 && dia.valor < 6) 
        }));
        this.isLoading = false;
      }
    });
  }

  getNombreDia(valorDia: number): string {
    const diaEncontrado = this.dias.find(d => d.valor === valorDia);
    return diaEncontrado ? diaEncontrado.nombre : '';
  }

  guardarCambios() {
    this.isSaving = true;

    const horariosActivos = this.horarios.filter(h => (h as any).activo);
    
    const peticiones = horariosActivos.map(horario => 
      this.disponibilidadService.guardarDisponibilidad(horario).pipe(
        catchError(error => {
          console.error(`Error al guardar el día ${horario.diaSemana}:`, error);
          return of(null); 
        })
      )
    );

    forkJoin(peticiones.length > 0 ? peticiones : [of('No hay cambios')]).subscribe({
      next: (resultados) => {
        if (resultados[0] === 'No hay cambios') {
          alert("No has activado ningún día. Se guardará tu disponibilidad como 'no disponible'.");
        } else {
          const todosExitosos = resultados.every(res => res !== null);
          if (todosExitosos) {
            alert('Disponibilidad actualizada con éxito.');
          } else {
            alert('Algunos horarios no se pudieron guardar. Por favor, revisa la consola para más detalles.');
          }
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error inesperado en forkJoin', err);
        alert('Ocurrió un error inesperado al guardar los horarios.');
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }
}