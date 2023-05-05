import { Publicacion } from "./publicacion";

export interface User {
    uid: string;
    nombre: string;
    apellido: string;
    rut: number;
    dv: string;
    correo: string;
    password: string;
    perfil: number;
    telefono: number;
    direccion: string;
    nacimiento: Date;
    calificaciones: number;
    comentarios: string;
}

export interface Trabajo {
    id?: string;
    trabajoId?: string;
    idPublicacion: string;
    idUsuarioPublicacion: string;
    idUsuarioSolicitante: string;
    mensaje: string;
    estado: 'pendiente' | 'aceptado' | 'rechazado';
    precio?: string;
    publicacion?: Publicacion;
  }
  