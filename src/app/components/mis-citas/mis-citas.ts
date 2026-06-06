import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitaService } from '../../../core/services/cita.service';
import { Cita } from '../../../core/models/cita.model';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-citas.html',
  styleUrls: ['./mis-citas.css']
})
export class MisCitasComponent implements OnInit {
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
        console.error('Error al cargar las citas', err);
        this.error = 'No se pudieron cargar las citas. Inténtalo más tarde.';
        this.isLoading = false;
      }
    });
  }
}