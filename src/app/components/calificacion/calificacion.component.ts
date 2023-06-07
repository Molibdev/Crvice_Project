import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User, Trabajo } from 'src/app/models/models';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-calificacion',
  templateUrl: './calificacion.component.html',
  styleUrls: ['./calificacion.component.css']
})
export class CalificacionComponent implements OnInit {

  calificacion: number = 0; // Calificación seleccionada por el usuario
  comentario: string = ''; // Comentario ingresado por el usuario
  usuarioCalificado: User | null = null; // Perfil del usuario a calificar
  usuarioId: string = ''; // ID del usuario actualmente logueado
  calificacionAnterior: number | null = null; // Calificación anterior del usuario a calificar
  trabajoId: string = ''; // ID del trabajo a calificar
  idUsuarioPublicacion: string = ''; // ID del usuario que publicó el trabajo

  constructor(
    private firebaseService: FirebaseService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private publicaciones: PublicacionesService,
    private toast: HotToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener el ID del usuario actualmente logueado
    this.usuarioId = this.publicaciones.uidUsuario || '';

    // Obtener el ID del trabajo a calificar de los parámetros de la URL
    this.trabajoId = this.route.snapshot.queryParams['trabajoId'];

    // Obtener el perfil del usuario a calificar y su calificación anterior
    this.firebaseService.getUserProfile(this.usuarioId).subscribe((user) => {
      this.usuarioCalificado = user;
      this.calificacionAnterior = user.calificaciones || null;
    });

    // Obtener el valor de idUsuarioPublicacion del documento de la colección Trabajos
    this.firebaseService.getTrabajo(this.trabajoId).subscribe((trabajo) => {
      if (trabajo && trabajo.idUsuarioPublicacion) {
        const idUsuarioPublicacion = trabajo.idUsuarioPublicacion;
        console.log('Valor de idUsuarioPublicacion ->', idUsuarioPublicacion);
        this.idUsuarioPublicacion = idUsuarioPublicacion;
      } else {
        console.log('El objeto trabajo es indefinido o no tiene la propiedad idUsuarioPublicacion');
      }
    });
  }

  async calificar() {
    // Verificar si el usuario ya ha sido calificado previamente
    if (!this.usuarioCalificado) {
      this.toast.info('Este usuario ya ha sido calificado.');
      return;
    }

    // Actualizar la calificación y comentarios del usuario
    this.usuarioCalificado.calificaciones = this.calificacion;
    this.usuarioCalificado.comentarios = this.comentario;

    // Actualizar el perfil del usuario en la base de datos
    await this.firebaseService.updateUserCalificaciones(
      this.usuarioCalificado.uid,
      this.usuarioCalificado.calificaciones,
      this.usuarioCalificado.comentarios
    );

    // Resetear las variables calificacion y uidUsuario
    this.calificacion = 0;
    this.publicaciones.uidUsuario = '';

    // Redirigir a la página de "contrataciones" si el usuario calificado es el mismo que publicó el trabajo
    if (this.usuarioCalificado.uid === this.idUsuarioPublicacion) {
      this.router.navigate(['/contrataciones']);
      this.toast.success('Trabajador calificado correctamente');
    } else {
      this.router.navigate(['/solicitudes']);
      this.toast.success('Cliente calificado correctamente');
    }
  }
}
