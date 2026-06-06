import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitaService } from '../../../core/services/cita.service';
import { Cita } from '../../../core/models/cita.model';

@Component({
  selector: 'app-agenda-profesional',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agenda-profesional.html',
  styleUrls: ['./agenda-profesional.css']
})
export class AgendaProfesionalComponent implements OnInit {
  private citaService = inject(CitaService);

  citas: Cita[] = [];
  isLoading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.citaService.getMisCitas().subscribe({
      next: (data) => {
        this.citas = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar la agenda', err);
        this.error = 'No se pudo cargar la agenda. Inténtalo más tarde.';
        this.isLoading = false;
      }
    });
  }
}