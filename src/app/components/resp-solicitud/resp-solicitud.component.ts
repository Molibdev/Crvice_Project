import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Calificacion, Trabajo } from 'src/app/models/models';
import { Publicacion } from 'src/app/models/publicacion';
import { User } from 'src/app/models/models';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { HotToastService } from '@ngneat/hot-toast';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-resp-solicitud',
  templateUrl: './resp-solicitud.component.html',
  styleUrls: ['./resp-solicitud.component.css']
})
export class RespSolicitudComponent implements OnInit {
  public trabajo: Trabajo | undefined;
  public publicacion: Publicacion | undefined;
  public nombreUsuarioSolicitante = '';
  public mensajeTrabajador = '';
  public uidCliente = '';
  public idTrabajo = '';
  public isLoading: boolean= false;
  ratings: Calificacion[] = [];
  averageRating: number = 0; // Variable para almacenar la calificación promedio
  mostrarCargarMas: boolean = true;
  mostrarCargarMenos: boolean = false;
  contador: number = 1;

  constructor(private route: ActivatedRoute, 
              private firestore: AngularFirestore, 
              private router: Router,  
              private toast: HotToastService, 
              private firebase: FirebaseService,
              private publicaciones: PublicacionesService) { }

              ngOnInit(): void {
                this.isLoading = true;
                this.route.queryParams.subscribe(params => {
                  const trabajoId = params['trabajoId'];
                  const publicacionId = params['publicacionId'];
                  this.idTrabajo = params['trabajoId'];
              
                  console.log('trabajoId:', trabajoId);
                  console.log('publicacionId:', publicacionId);
              
                  this.firestore.collection<Trabajo>('Trabajos').doc(trabajoId).get().toPromise().then((trabajoDoc) => {
                    if (trabajoDoc && trabajoDoc.exists) {
                      this.trabajo = trabajoDoc.data() as Trabajo;
                      this.firestore.collection<User>('Usuarios').doc(this.trabajo.idUsuarioSolicitante).get().toPromise().then((usuarioDoc) => {
                        if (usuarioDoc && usuarioDoc.exists) {
                          const usuario = usuarioDoc.data() as User;
                          this.nombreUsuarioSolicitante = usuario.nombre + ' ' + usuario.apellido;
                          this.publicaciones.uidUsuario = usuario.uid;
                          this.publicaciones.uidUsuarioMapa = usuario.uid;
                          this.publicaciones.usuarioComuna = usuario.comuna;
                          this.publicaciones.usuarioDireccion = usuario.direccion + ' ' + usuario.numDireccion;
                          console.log(this.publicaciones.usuarioComuna)
                          console.log(this.publicaciones.usuarioDireccion)
                        }
                      });
              
                      // Obtener las calificaciones y comentarios
                      const path = `Usuarios/${this.trabajo.idUsuarioSolicitante}/calificaciones`;
                      this.firebase.getCollection<Calificacion>(path).subscribe(calificaciones => {
                        this.ratings = calificaciones;
                      });
              
                      // Calcular la calificación promedio
                      this.calculateAverageRating(this.trabajo.idUsuarioSolicitante);
                    }
                  });
              
                  this.firestore.collection<Publicacion>('Publicaciones').doc(publicacionId).get().toPromise().then((publicacionDoc) => {
                    if (publicacionDoc && publicacionDoc.exists) {
                      this.publicacion = publicacionDoc.data() as Publicacion;
                      this.isLoading = false;
                    }
                  });
                });
              }
              
              calculateAverageRating(uid: string) {
                const path = `Usuarios/${uid}/calificaciones`;
                this.firebase
                  .getCollection<Calificacion>(path)
                  .subscribe(calificaciones => {
                    const ratings = calificaciones;
                    let totalRating = 0;
                    for (const rating of ratings) {
                      totalRating += +rating.calificacion; // Convertir a número utilizando el prefijo '+'
                    }
                    console.log('Calificación Total:', totalRating);
                    console.log('Cantidad de Calificaciones:', ratings.length);
                    this.averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;
                    console.log('Calificación Promedio:', this.averageRating);
                  });
              }
              

  actualizarTrabajo(): void {
    if (this.trabajo && this.trabajo.precio !== undefined) {
      const price = this.trabajo.precio.toString();
      // Validate price format
      const pricePattern = /^\d{1,3}(\.\d{3})*$/; // Regular expression to match the CLP format
      if (!pricePattern.test(price)) {
        console.log('Invalid price format');
        this.toast.error('El precio es inválido')
        this.toast.error('El formato es 000.000.000')
        // You can show an error message to the user or perform any other necessary action
        return; // Stop executing the method
      }
  
      this.trabajo.mensajeTrabajador = this.mensajeTrabajador;
      this.trabajo.estado = 'Respondido';
  
      const trabajoId = this.route.snapshot.queryParams['trabajoId'];
      this.firestore.collection<Trabajo>('Trabajos').doc(trabajoId).update(this.trabajo).then(() => {
        console.log('Trabajo actualizado con éxito');
        this.toast.success('Solicitud Respondida');
        this.router.navigate(['/solicitudes']);
      }).catch((error) => {
        console.error('Error al actualizar el trabajo:', error);
      });
    }
  }
  
  rechazarTrabajo(): void {
    if (this.trabajo) {
      this.trabajo.estado = 'Cancelado'; 
      const trabajoId = this.route.snapshot.queryParams['trabajoId'];
      this.firestore.collection<Trabajo>('Trabajos').doc(trabajoId).update(this.trabajo).then(() => {
        console.log('Trabajo actualizado con éxito');
      }).catch((error) => {
        console.error('Error al actualizar el trabajo:', error);
      });
    }
  }  

  completarTrabajo(): void {
    if (this.trabajo) {
      this.trabajo.estado = 'Terminado'; 
      const trabajoId = this.route.snapshot.queryParams['trabajoId'];
      this.firestore.collection<Trabajo>('Trabajos').doc(trabajoId).update(this.trabajo).then(() => {
        console.log('Trabajo actualizado con éxito');
      }).catch((error) => {
        console.error('Error al actualizar el trabajo:', error);
      });
    }
    this.router.navigate(['/calificacion'])
  }  

  verUbicacion(){
    const queryParams = {
      trabajadorId: this.idTrabajo,
    };
    this.router.navigate(['/mapa'], { queryParams })
  }
  cargarMasComentarios() {
    this.contador += 5;
    this.mostrarCargarMenos = true;
  
    if (this.contador >= this.ratings.length) {
      this.mostrarCargarMas = false;
    }
  }
  cargarMenosComentarios() {
    this.contador = 1;
    this.mostrarCargarMas = true;
  
  }
}