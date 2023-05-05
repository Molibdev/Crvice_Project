import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Trabajo } from 'src/app/models/models';
import { Publicacion } from 'src/app/models/publicacion';
import { User } from 'src/app/models/models';

@Component({
  selector: 'app-resp-solicitud',
  templateUrl: './resp-solicitud.component.html',
  styleUrls: ['./resp-solicitud.component.css']
})
export class RespSolicitudComponent implements OnInit {
  public trabajo: Trabajo | undefined;
  public publicacion: Publicacion | undefined;
  public nombreUsuarioSolicitante = '';

  constructor(private route: ActivatedRoute, private firestore: AngularFirestore) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const trabajoId = params['trabajoId'];
      const publicacionId = params['publicacionId'];
  
      console.log('trabajoId:', trabajoId);
      console.log('publicacionId:', publicacionId);
  
      this.firestore.collection<Trabajo>('Trabajos').doc(trabajoId).get().toPromise().then((trabajoDoc) => {
        if (trabajoDoc && trabajoDoc.exists) {
          this.trabajo = trabajoDoc.data() as Trabajo;
          this.firestore.collection<User>('Usuarios').doc(this.trabajo.idUsuarioSolicitante).get().toPromise().then((usuarioDoc) => {
            if (usuarioDoc && usuarioDoc.exists) {
              const usuario = usuarioDoc.data() as User;
              this.nombreUsuarioSolicitante = usuario.nombre + ' ' + usuario.apellido;
            }
          });
        }
      });
  
      this.firestore.collection<Publicacion>('Publicaciones').doc(publicacionId).get().toPromise().then((publicacionDoc) => {
        if (publicacionDoc && publicacionDoc.exists) {
          this.publicacion = publicacionDoc.data() as Publicacion;
        }
      });
    });
  }
}
