import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from 'src/app/models/models';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { PublicacionesService } from 'src/app/services/publicaciones.service';

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
  

  constructor(private firebaseService: FirebaseService, 
              private route: ActivatedRoute,
              private authService: AuthService,
              private publicaciones: PublicacionesService) { }

  // ngOnInit(): void {
  //   // Obtener el UID del usuario conectado
  //   this.authService.getUid().then(uid => {
  //     this.usuarioId = uid || '';
  //     // Obtener el perfil del usuario que está siendo calificado
  //     this.firebaseService.getUserProfile(this.usuarioId).subscribe((user) => {
  //       this.usuarioCalificado = user;
  //       this.calificacionAnterior = user.calificaciones || null;
  //     });
  //   });
  // }

  ngOnInit(): void {
      this.usuarioId = this.publicaciones.uidUsuario || ''; // Asignamos el valor a la variable
      console.log('ID DEL USUARIO A CALIFICAR ->', this.usuarioId);
      this.firebaseService.getUserProfile(this.usuarioId).subscribe((user) => {
        this.usuarioCalificado = user;
        this.calificacionAnterior = user.calificaciones || null;
       });
  }



  async calificar() {
    // Revisa si el usuario ya ha sido calificado, si no lo ha sido, detiene la ejecución de la función
    if (!this.usuarioCalificado) {
      return;
    }
  
    // Actualiza la calificación del usuario con el nuevo número
    this.usuarioCalificado.calificaciones = this.calificacion;
    this.usuarioCalificado.comentarios  = this.comentario;
  
    // Actualiza el perfil del usuario con la nueva calificación
    await this.firebaseService.updateUserCalificaciones(this.usuarioCalificado.uid, this.usuarioCalificado.calificaciones, this.usuarioCalificado.comentarios);
  
    // Resetea la variable calificacion a 0
    this.calificacion = 0;
    this.publicaciones.uidUsuario = '';
  }

  

  

}
