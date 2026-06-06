import { Usuario } from "./usuario.model";
export interface Cita {
  _id: string;
  profesional: Usuario | string; 
  cliente: Usuario | string;     
  fecha: string; 
  motivo: string;
  estado: 'Programada' | 'Completada' | 'Cancelada';
  origen: 'plataforma' | 'manual';
  createdAt: string;
  updatedAt: string;
}
