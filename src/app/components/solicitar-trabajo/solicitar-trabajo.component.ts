import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Publicacion } from 'src/app/models/publicacion';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Trabajo } from 'src/app/models/models';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-solicitar-trabajo',
  templateUrl: './solicitar-trabajo.component.html',
  styleUrls: ['./solicitar-trabajo.component.css']
})
export class SolicitarTrabajoComponent implements OnInit {
  public id: string | null = null; // Variable para almacenar el ID
  public uid: string | null = null; // Variable para almacenar el UID
  public currentUserUid: string | null = null; // Variable para almacenar el UID del usuario actual
  public mensaje: string = ''; // Variable para almacenar el mensaje
  public precioPublicacion: string | undefined; // Variable para almacenar el precio de la publicación

  public publicacion?: Publicacion; // Variable para almacenar la publicación

  constructor(
    private publicacionesService: PublicacionesService,
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private toast: HotToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id'); // Obtener el ID de los parámetros de la ruta
    this.uid = this.route.snapshot.paramMap.get('uid'); // Obtener el UID de los parámetros de la ruta
    this.currentUserUid = this.route.snapshot.paramMap.get('currentUserUid'); // Obtener el UID del usuario actual de los parámetros de la ruta

    if (this.id !== null) {
      // Obtener la publicación del servicio de publicaciones
      this.publicacionesService.getPublicacion(this.id).subscribe(publicacion => {
        this.publicacion = publicacion; // Almacenar la publicación en la variable
        this.precioPublicacion = publicacion.precio; // Almacenar el precio de la publicación
      });
    }
  }

  enviarSolicitud() {
    const trabajo: Trabajo = {
      idPublicacion: this.id!,
      idUsuarioPublicacion: this.uid!,
      idUsuarioSolicitante: this.currentUserUid!,
      mensaje: this.mensaje,
      estado: 'Pendiente',
      precio: this.precioPublicacion,
    };
    // Agregar el trabajo a la colección 'Trabajos' en Firestore
    this.firestore.collection('Trabajos').add(trabajo)
      .then(() => {
        console.log('Trabajo enviado exitosamente');
        this.toast.success('Trabajo Solicitado'); // Mostrar un mensaje de éxito
        this.router.navigate(['/contrataciones']); // Navegar a la página de contrataciones
      })
      .catch((error) => {
        console.log('Error al enviar el trabajo', error);
      });
  }

  public volver(): void {
    history.back(); // Volver a la página anterior
  }
}
