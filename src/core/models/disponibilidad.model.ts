export interface Disponibilidad {
  _id?: string;
  profesional?: string;
  diaSemana: number;   
  horaInicio: string;   
  horaFin: string;      
  duracionCita: number; 
  activo?: boolean;     
}