export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  numeroIdentificacion: string;
  correo: string;
  rol: 'profesional' | 'cliente';
  profesion?: string; 
  telefono?: string;
}

export interface AuthResponse {
  mensaje: string;
  usuario: Usuario;
  token: string;
}