import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Trabajo } from 'src/app/models/models';
import { Publicacion } from 'src/app/models/publicacion';
@Component({
  selector: 'app-contrataciones',
  templateUrl: './contrataciones.component.html',
  styleUrls: ['./contrataciones.component.css']
})
export class ContratacionesComponent implements OnInit {
  public trabajos: Trabajo[] = [];
  public isLoading: boolean= false;

  constructor(private firestore: AngularFirestore,private router: Router, private auth: AngularFireAuth) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.cargarTrabajos(user.uid);
      }
    }); 
    
  }
  private cargarTrabajos(usuarioId: string): void {
    
    this.firestore
      .collection<Trabajo>('Trabajos', (ref) =>
        ref.where('idUsuarioSolicitante', '==', usuarioId)
      )
      .get()
      .toPromise()
      .then((trabajosSnapshot) => {
        if (trabajosSnapshot) {
          const trabajosPromises = trabajosSnapshot.docs.map((trabajoDoc) => {
            const trabajo: Trabajo = {
              id: trabajoDoc.id, // Aquí se asigna el ID del trabajo
              ...trabajoDoc.data()
            } as Trabajo;
            trabajo.trabajoId = trabajoDoc.id; // Asignar el valor del id generado automáticamente a la propiedad trabajoId
            return this.firestore
              .collection<Publicacion>('Publicaciones')
              .doc(trabajo.idPublicacion)
              .get()
              .toPromise()
              .then((publicacionDoc) => {
                if (publicacionDoc && publicacionDoc.exists) {
                  trabajo.publicacion = {
                    id: publicacionDoc.id,
                    ...publicacionDoc.data()
                  } as Publicacion;
                }
                return trabajo;
              });
          });
          Promise.all(trabajosPromises).then((trabajos) => {
            this.trabajos = trabajos;
            this.isLoading = false;
          });
        }
      });
      
  }
  
  responderSolicitud(trabajo: Trabajo) {
    if (trabajo.publicacion && trabajo.publicacion.id) {
      const queryParams = {
        trabajoId: trabajo.id,
        publicacionId: trabajo.publicacion.id
      };
      this.router.navigate(['/resp-trabajo'], { queryParams });
    } else {
      console.error('El trabajo no tiene una publicación definida');
    }
  }
  
}