import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es'; 
import { CitaService } from '../../../core/services/cita.service';
import { AuthService } from '../../../core/services/auth.service';
import { Cita } from '../../../core/models/cita.model';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    FullCalendarModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export default class DashboardComponent implements OnInit, OnDestroy {
  private citaService = inject(CitaService);
  private authService = inject(AuthService);
  private router = inject(Router);

  usuarioLogueado: Usuario | null = null;
  private usuarioSubscription!: Subscription;
  private todasMisCitas = signal<Cita[]>([]);
  terminoBusqueda = signal<string>('');
  
  citasFiltradas = computed(() => {
    const citas = this.todasMisCitas();
    const busqueda = this.terminoBusqueda().toLowerCase();
    if (!busqueda) return citas;
    return citas.filter(cita => {
      const contraparte = (this.usuarioLogueado?.rol === 'profesional' ? cita.cliente : cita.profesional) as Usuario;
      if (!contraparte || typeof contraparte === 'string') return false;
      return contraparte.nombre.toLowerCase().includes(busqueda) || 
             contraparte.apellido.toLowerCase().includes(busqueda);
    });
  });

  isLoading = true;
  mostrarModal = false;
  esModoEdicion = false;
  citaParaEditar: Cita | null = null;
  clientes: Usuario[] = [];
  isLoadingClientes = false;
  isSavingCita = false;
  citaManualData = { clienteId: '', fecha: '', hora: '', motivo: '' };
  calendarioVisible = true;
  mostrarModalRecordatorio = false;
  citaSeleccionada: Cita | null = null;
  
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    weekends: true,
    events: [],
    eventClick: this.handleEventClick.bind(this),
    locale: esLocale, 
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    buttonText: {
      today: 'Hoy'
    },
    dayMaxEvents: true,
  };

  ngOnInit(): void {
    this.usuarioSubscription = this.authService.usuarioActual$.subscribe(usuario => {
      this.usuarioLogueado = usuario;

      if (usuario) {
        this.isLoading = true;
        this.citaService.getMisCitas().subscribe({
          next: (data) => {
            this.todasMisCitas.set(data);
            this.isLoading = false;

            const eventos = data.map(cita => ({
              id: cita._id,
              title: this.getNombreContraparte(cita),
              date: cita.fecha,
              backgroundColor: this.getColorPorEstado(cita.estado),
              borderColor: this.getColorPorEstado(cita.estado)
            }));
            this.calendarOptions.events = eventos;
          },
          error: (err) => {
            console.error('Error al cargar las citas', err);
            alert('No se pudo cargar tu agenda. Por favor, intenta recargar la página.');
            this.isLoading = false;
          }
        });
      } else {
        this.isLoading = false;
        this.todasMisCitas.set([]);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.usuarioSubscription) {
      this.usuarioSubscription.unsubscribe();
    }
  }

  toggleCalendario(): void {
    this.calendarioVisible = !this.calendarioVisible;
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const citaId = clickInfo.event.id;
    const citaEncontrada = this.todasMisCitas().find(c => c._id === citaId);
    if (citaEncontrada) {
      this.citaSeleccionada = citaEncontrada;
      this.mostrarModalRecordatorio = true;
    }
  }

  cerrarModalRecordatorio(): void {
    this.mostrarModalRecordatorio = false;
    this.citaSeleccionada = null;
  }

  onBusquedaInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.terminoBusqueda.set(target.value);
  }

  abrirModalCrearCita(): void {
    this.esModoEdicion = false;
    this.citaManualData = { clienteId: '', fecha: '', hora: '', motivo: '' };
    this.mostrarModal = true;
    this.isLoadingClientes = true;
    
    this.citaService.getClientes().subscribe({
      next: (data) => {
        console.log('Usuarios recibidos del Backend:', data);
        
        // Filtro robusto que tolera las propiedades 'rol' o 'role' y mayúsculas/minúsculas
        this.clientes = data.filter(u => {
          const rolUsuario = u.rol || (u as any).role; 
          return rolUsuario && rolUsuario.toLowerCase() === 'cliente';
        });
        
        this.isLoadingClientes = false;
      },
      error: (err) => {
        console.error('Error al obtener clientes:', err);
        alert('No se pudo cargar la lista de clientes.');
        this.cerrarModal();
      }
    });
  }

  abrirModalEditarCita(cita: Cita): void {
    this.esModoEdicion = true;
    this.citaParaEditar = cita;
    const fechaCita = new Date(cita.fecha);
    this.citaManualData = {
      clienteId: (cita.cliente as Usuario)._id,
      fecha: formatDate(fechaCita, 'yyyy-MM-dd', 'en-US'),
      hora: formatDate(fechaCita, 'HH:mm', 'en-US', 'UTC'),
      motivo: cita.motivo
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.citaParaEditar = null;
  }

  guardarCita(): void {
    if (this.esModoEdicion) {
      this.ejecutarActualizacionCita();
    } else {
      this.ejecutarCreacionCita();
    }
  }

  private ejecutarCreacionCita(): void {
    if (!this.citaManualData.clienteId || !this.citaManualData.fecha || !this.citaManualData.hora || !this.citaManualData.motivo) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    this.isSavingCita = true;
    const fechaHoraISO = `${this.citaManualData.fecha}T${this.citaManualData.hora}:00`;
    const datosFinales = { clienteId: this.citaManualData.clienteId, fecha: fechaHoraISO, motivo: this.citaManualData.motivo };

    this.citaService.crearCitaManual(datosFinales).subscribe({
      next: (nuevaCita) => {
        alert('Cita creada manualmente con éxito.');
        const clienteSeleccionado = this.clientes.find(c => c._id === nuevaCita.cliente);
        if (clienteSeleccionado) {
          nuevaCita.cliente = clienteSeleccionado;
        }
        this.todasMisCitas.update(citas => [nuevaCita, ...citas]);
        this.actualizarEventosCalendario();
        this.cerrarModal();
      },
      error: (err) => {
        alert(`Error al crear la cita: ${err.error.mensaje || 'Inténtalo de nuevo.'}`);
        this.isSavingCita = false;
      },
      complete: () => this.isSavingCita = false
    });
  }

  private ejecutarActualizacionCita(): void {
    if (!this.citaParaEditar) return;
    this.isSavingCita = true;
    const fechaHoraISO = `${this.citaManualData.fecha}T${this.citaManualData.hora}:00`;
    const datosActualizados = { fecha: fechaHoraISO, motivo: this.citaManualData.motivo };

    this.citaService.actualizarCita(this.citaParaEditar._id, datosActualizados).subscribe({
      next: (citaActualizada) => {
        alert('Cita actualizada con éxito.');
        citaActualizada.cliente = this.citaParaEditar!.cliente;
        citaActualizada.profesional = this.citaParaEditar!.profesional;
        
        this.todasMisCitas.update(citas => 
          citas.map(c => c._id === citaActualizada._id ? citaActualizada : c)
        );
        this.actualizarEventosCalendario();
        this.cerrarModal();
      },
      error: (err) => {
        alert(`Error al actualizar la cita: ${err.error.mensaje || 'Inténtalo de nuevo.'}`);
        this.isSavingCita = false;
      },
      complete: () => this.isSavingCita = false
    });
  }

  onCancelCita(citaId: string): void {
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) return;

    this.citaService.cancelarCita(citaId).subscribe({
      next: (citaCancelada) => {
        alert('La cita ha sido cancelada.');
        this.todasMisCitas.update(citas => 
          citas.map(c => c._id === citaId ? citaCancelada : c)
        );
        this.actualizarEventosCalendario();
      },
      error: (err) => {
        alert(`Error al cancelar la cita: ${err.error.mensaje || 'Inténtalo de nuevo.'}`);
      }
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getNombreContraparte(cita: Cita): string {
    if (!this.usuarioLogueado) return '';
    const contraparte = (this.usuarioLogueado.rol === 'profesional' ? cita.cliente : cita.profesional) as Usuario;
    if (!contraparte || typeof contraparte === 'string') return 'Cargando...';
    return `${contraparte.nombre} ${contraparte.apellido}`;
  }

  private actualizarEventosCalendario(): void {
    const eventos = this.todasMisCitas().map(cita => ({
      id: cita._id,
      title: this.getNombreContraparte(cita),
      date: cita.fecha,
      backgroundColor: this.getColorPorEstado(cita.estado),
      borderColor: this.getColorPorEstado(cita.estado)
    }));
    this.calendarOptions.events = eventos;
  }

  private getColorPorEstado(estado: string): string {
    switch (estado) {
      case 'Cancelada': return '#ef4444';
      case 'Completada': return '#22c55e';
      case 'Programada':
      default:
        return '#3b82f6';
    }
  }
}