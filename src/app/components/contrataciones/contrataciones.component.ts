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
  public trabajos: Trabajo[] = []; // Lista de trabajos
  public isLoading: boolean = false; // Indicador de carga
  public sinContrataciones: boolean = false; // Indicador de falta de trabajos

  constructor(
    private firestore: AngularFirestore,
    private router: Router,
    private auth: AngularFireAuth
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    // Verifica el estado de autenticación del usuario
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.cargarTrabajos(user.uid);
      }
    });
  }

  private cargarTrabajos(usuarioId: string): void {
    // Carga los trabajos del usuario desde la base de datos
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
              id: trabajoDoc.id, // Asigna el ID del trabajo
              ...trabajoDoc.data()
            } as Trabajo;
            trabajo.trabajoId = trabajoDoc.id; // Asigna el valor del ID generado automáticamente a la propiedad trabajoId

            // Obtiene la publicación asociada al trabajo
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

          // Ejecuta todas las promesas de obtención de trabajos y publicaciones
          Promise.all(trabajosPromises).then((trabajos) => {
            this.trabajos = trabajos;
            this.isLoading = false;

            // Verifica si no hay trabajos para mostrar
            if (this.trabajos.length == 0) {
              this.sinContrataciones = true;
            }
          });
        }
      });
  }

  responderSolicitud(trabajo: Trabajo) {
    // Navega a la página de respuesta al trabajo con los parámetros necesarios
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
