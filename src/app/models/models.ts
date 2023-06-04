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
    numDireccion: number;
    comuna: string;
    nacimiento: Date;
    calificaciones: number;
    comentarios: string;
    photoURL?: string;
    PromedioCalificaciones?:number;
    NumeroCalificaciones?:number;
}

  export interface Trabajo {
    id?: string;
    trabajoId?: string;
    idPublicacion: string;
    idUsuarioPublicacion: string;
    idUsuarioSolicitante: string;
    mensaje: string;
    mensajeTrabajador?: string;
    estado: 'Pendiente' | 'Aceptado' | 'Cancelado' | 'Respondido' | 'Completado' | 'Abonado' | 'Calificado Por Cliente' | 'Terminado';
    precio?: string;
    publicacion?: Publicacion;
    photoPost?: string;
  }
  
  export interface Calificacion {
      calificacion: number;
      comentario: string;
  }

  export interface userDataBank {
    idUsuarioCuenta: string;
    IdCuenta:  string;
    NumCuenta: number;
    TipoCuenta: string;
    Banco: string;
  }
  