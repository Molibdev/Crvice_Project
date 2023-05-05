import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Publicacion } from 'src/app/models/publicacion'; 
import { PublicacionesService } from 'src/app/services/publicaciones.service'; 
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Trabajo } from 'src/app/models/models';

@Component({
  selector: 'app-solicitar-trabajo',
  templateUrl: './solicitar-trabajo.component.html',
  styleUrls: ['./solicitar-trabajo.component.css']
})
export class SolicitarTrabajoComponent implements OnInit {
  public id: string | null = null;
  public uid: string | null = null;
  public currentUserUid: string | null = null;
  public mensaje: string = '';
  public precioPublicacion: string | undefined;

  publicacion?: Publicacion;

  constructor(private publicacionesService: PublicacionesService,
              private route: ActivatedRoute,
              private firestore: AngularFirestore) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.uid = this.route.snapshot.paramMap.get('uid');
    this.currentUserUid = this.route.snapshot.paramMap.get('currentUserUid');

    if (this.id !== null) {
      this.publicacionesService.getPublicacion(this.id).subscribe(publicacion => {
        this.publicacion = publicacion;
        this.precioPublicacion = publicacion.precio;
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
    this.firestore.collection('Trabajos').add(trabajo)
      .then(() => {
        console.log('Trabajo enviado exitosamente');
        // Lógica adicional aquí,
      })
      .catch((error) => {
        console.log('Error al enviar el trabajo', error);
      });
  }

  public volver(): void {
    history.back();
  }
  
}

