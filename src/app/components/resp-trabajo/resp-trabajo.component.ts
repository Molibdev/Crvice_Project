import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Trabajo } from 'src/app/models/models';
import { Publicacion } from 'src/app/models/publicacion';
import { User } from 'src/app/models/models';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-resp-trabajo',
  templateUrl: './resp-trabajo.component.html',
  styleUrls: ['./resp-trabajo.component.css']
})
export class RespTrabajoComponent {
  public trabajo: Trabajo | undefined; // Variable para almacenar el trabajo
  public publicacion: Publicacion | undefined; // Variable para almacenar la publicación
  public nombreTrabajador = ''; // Variable para almacenar el nombre del trabajador
  public mensajeTrabajador = ''; // Variable para almacenar el mensaje del trabajador
  public uidTrabajador = ''; // Variable para almacenar el ID del trabajador
  public isLoading: boolean= false; // Variable para indicar si se está cargando

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private toast: HotToastService,
    private router: Router,
    private publicaciones: PublicacionesService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.route.queryParams.subscribe(params => {
      const trabajoId = params['trabajoId']; // Obtener el ID del trabajo de los parámetros de la ruta
      const publicacionId = params['publicacionId']; // Obtener el ID de la publicación de los parámetros de la ruta
  
      console.log('trabajoId:', trabajoId);
      console.log('publicacionId:', publicacionId);
  
      // Obtener el documento del trabajo de Firestore
      this.firestore.collection<Trabajo>('Trabajos').doc(trabajoId).get().toPromise().then((trabajoDoc) => {
        if (trabajoDoc && trabajoDoc.exists) {
          this.trabajo = trabajoDoc.data() as Trabajo; // Almacenar los datos del trabajo en la variable
          // Obtener el documento del usuario de Firestore
          this.firestore.collection<User>('Usuarios').doc(this.trabajo.idUsuarioPublicacion).get().toPromise().then((usuarioDoc) => {
            if (usuarioDoc && usuarioDoc.exists) {
              const usuario = usuarioDoc.data() as User;
              this.nombreTrabajador = usuario.nombre + ' ' + usuario.apellido; // Almacenar el nombre del trabajador
              this.publicaciones.uidUsuario = usuario.uid; // Establecer el ID del usuario en el servicio de publicaciones
            }
          });
        }
      });
  
      // Obtener el documento de la publicación de Firestore
      this.firestore.collection<Publicacion>('Publicaciones').doc(publicacionId).get().toPromise().then((publicacionDoc) => {
        if (publicacionDoc && publicacionDoc.exists) {
          this.publicacion = publicacionDoc.data() as Publicacion; // Almacenar los datos de la publicación en la variable
          this.isLoading = false; // Indicar que la carga ha finalizado
        }
      });
    });
  }

  aceptarTrabajo(): void {
    if (this.trabajo) {
      this.trabajo.estado = 'Aceptado'; // Actualizar el estado del trabajo a 'Aceptado'
      const trabajoId = this.route.snapshot.queryParams['trabajoId']; // Obtener el ID del trabajo de los parámetros de la ruta
      // Actualizar el documento del trabajo en Firestore
      this.firestore.collection<Trabajo>('Trabajos').doc(trabajoId).update(this.trabajo).then(() => {
        console.log('Trabajo actualizado con éxito');
        this.toast.success('Trabajo Contratado'); // Mostrar un mensaje de éxito
      }).catch((error) => {
        console.error('Error al actualizar el trabajo:', error);
      });
    }
  }  

  rechazarTrabajo(): void {
    if (this.trabajo) {
      this.trabajo.estado = 'Cancelado'; // Actualizar el estado del trabajo a 'Cancelado'
      const trabajoId = this.route.snapshot.queryParams['trabajoId']; // Obtener el ID del trabajo de los parámetros de la ruta
      // Actualizar el documento del trabajo en Firestore
      this.firestore.collection<Trabajo>('Trabajos').doc(trabajoId).update(this.trabajo).then(() => {
        console.log('Trabajo actualizado con éxito');
        this.toast.error('Trabajo Cancelado'); // Mostrar un mensaje de error
        this.router.navigate(['/contrataciones']); // Navegar a la página de contrataciones
      }).catch((error) => {
        console.error('Error al actualizar el trabajo:', error);
      });
    }
  }  

  calificar(): void {
    if (this.trabajo) {
      this.trabajo.estado = 'Calificado Por Cliente'; // Actualizar el estado del trabajo a 'Calificado Por Cliente'
      const trabajoId = this.route.snapshot.queryParams['trabajoId']; // Obtener el ID del trabajo de los parámetros de la ruta
      // Actualizar el documento del trabajo en Firestore
      this.firestore.collection<Trabajo>('Trabajos').doc(trabajoId).update(this.trabajo).then(() => {
        console.log('Trabajo actualizado con éxito');
        this.router.navigate(['/calificacion'], { queryParams: { trabajoId } }); // Agrega el parámetro trabajoId a la URL de navegación
      }).catch((error) => {
        console.error('Error al actualizar el trabajo:', error);
      });
    }
  }

  pagar() {
    if (this.trabajo) {
      const trabajoId = this.route.snapshot.queryParams['trabajoId']; // Obtener el ID del trabajo de los parámetros de la ruta
      const publicacionId = this.route.snapshot.queryParams['publicacionId']; // Obtener el ID de la publicación de los parámetros de la ruta
      this.router.navigate(['/pago'], { queryParams: { trabajoId, publicacionId } }); // Navegar a la página de pago con los parámetros trabajoId y publicacionId
    }
  }
}
