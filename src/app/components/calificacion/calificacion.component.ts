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

  calificacion: number = 0;
  comentario: string = '';
  usuarioCalificado: User | null = null;
  usuarioId: string = '';
  calificacionAnterior: number | null = null;
  trabajoId: string = '';
   idUsuarioPublicacion: string='';
   
  constructor(
    private firebaseService: FirebaseService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private publicaciones: PublicacionesService,
    private toast: HotToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioId = this.publicaciones.uidUsuario || '';
    this.trabajoId = this.route.snapshot.queryParams['trabajoId'];
    console.log('ID DEL USUARIO A CALIFICAR ->', this.usuarioId);
    console.log('ID DEL TRABAJO ->', this.trabajoId);
    this.firebaseService.getUserProfile(this.usuarioId).subscribe((user) => {
      this.usuarioCalificado = user;
      this.calificacionAnterior = user.calificaciones || null;
    });
  
    // Access the value of idUsuarioPublicacion from the Trabajos collection document
    this.firebaseService.getTrabajo(this.trabajoId).subscribe((trabajo) => {
      if (trabajo && trabajo.idUsuarioPublicacion) {
        const idUsuarioPublicacion = trabajo.idUsuarioPublicacion;
        console.log('Valor de idUsuarioPublicacion ->', idUsuarioPublicacion);
        this.idUsuarioPublicacion= idUsuarioPublicacion;
      } else {
        console.log('El objeto trabajo es indefinido o no tiene la propiedad idUsuarioPublicacion');
      }
    });
  }
  
  async calificar() {
    if (!this.usuarioCalificado) {
      this.toast.info('Este usuario ya ha sido calificado.');
      return;
    }

    // Actualizar la calificación del usuario con el nuevo número
    this.usuarioCalificado.calificaciones = this.calificacion;
    this.usuarioCalificado.comentarios = this.comentario;

    // Actualizar el perfil del usuario con la nueva calificación
    await this.firebaseService.updateUserCalificaciones(
      this.usuarioCalificado.uid,
      this.usuarioCalificado.calificaciones,
      this.usuarioCalificado.comentarios
    );

  

    // Resetea la variable calificacion a 0
    this.calificacion = 0;
    this.publicaciones.uidUsuario = '';

    // Redirigir a la pestaña de /contrataciones si es el mismo usuario

    if (this.usuarioCalificado.uid === this.idUsuarioPublicacion) {
      this.router.navigate(['/contrataciones']);
      this.toast.success('Trabajor Calificado correctamente');
    } else {
      this.router.navigate(['/solicitudes']);
      this.toast.success('Cliente Calificado correctamente');
    }
  }
}
